from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request, Header
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import re
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
import jwt
from passlib.context import CryptContext
from emergentintegrations.payments.stripe.checkout import (
    StripeCheckout, 
    CheckoutSessionResponse, 
    CheckoutStatusResponse, 
    CheckoutSessionRequest
)

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Configuration
JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'default_secret')
JWT_ALGORITHM = os.environ.get('JWT_ALGORITHM', 'HS256')
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.environ.get('ACCESS_TOKEN_EXPIRE_MINUTES', 1440))

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Stripe configuration
STRIPE_API_KEY = os.environ.get('STRIPE_API_KEY', '')

# Free delivery threshold
FREE_DELIVERY_THRESHOLD = 14000

# Create the main app
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ============= MODELS =============

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    email: str
    name: str
    created_at: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class Category(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    slug: str
    icon: Optional[str] = None
    parent_id: Optional[str] = None
    order: int = 0

class Product(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    slug: str
    description: str
    price: float
    original_price: Optional[float] = None
    discount_percent: Optional[int] = None
    image_url: str
    category_id: str
    health_category: Optional[str] = None
    stock: int = 100
    unit: str = "db"
    is_featured: bool = False
    is_discounted: bool = False
    attributes: dict = Field(default_factory=dict)
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class CartItem(BaseModel):
    product_id: str
    quantity: int

class CartItemResponse(BaseModel):
    product_id: str
    name: str
    price: float
    original_price: Optional[float] = None
    discount_percent: Optional[int] = None
    image_url: str
    quantity: int
    subtotal: float

class CartResponse(BaseModel):
    items: List[CartItemResponse]
    total: float
    delivery_fee: float
    grand_total: float
    free_delivery_threshold: int = FREE_DELIVERY_THRESHOLD

class OrderCreate(BaseModel):
    shipping_name: str
    shipping_address: str
    shipping_city: str
    shipping_postal_code: str
    shipping_phone: str
    notes: Optional[str] = None

class Order(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    items: List[CartItemResponse]
    total: float
    delivery_fee: float
    grand_total: float
    shipping_name: str
    shipping_address: str
    shipping_city: str
    shipping_postal_code: str
    shipping_phone: str
    notes: Optional[str] = None
    status: str = "pending"
    payment_status: str = "pending"
    payment_session_id: Optional[str] = None
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class PaymentTransaction(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: Optional[str] = None
    order_id: str
    session_id: str
    amount: float
    currency: str = "huf"
    status: str = "initiated"
    payment_status: str = "pending"
    metadata: Dict[str, str] = {}
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class CheckoutRequest(BaseModel):
    origin_url: str
    order_id: str

# ============= AUTH HELPERS =============

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)

async def get_current_user(authorization: Optional[str] = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Token hiányzik")
    
    try:
        token = authorization.replace("Bearer ", "")
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Érvénytelen token")
        
        user = await db.users.find_one({"id": user_id}, {"_id": 0, "password": 0})
        if not user:
            raise HTTPException(status_code=401, detail="Felhasználó nem található")
        
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token lejárt")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Érvénytelen token")

async def get_optional_user(authorization: Optional[str] = Header(None)):
    if not authorization:
        return None
    try:
        return await get_current_user(authorization)
    except:
        return None

# ============= AUTH ROUTES =============

@api_router.post("/auth/register", response_model=TokenResponse)
async def register(user_data: UserCreate):
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Ez az email cím már regisztrálva van")
    
    user_id = str(uuid.uuid4())
    hashed_password = get_password_hash(user_data.password)
    
    user_doc = {
        "id": user_id,
        "email": user_data.email,
        "name": user_data.name,
        "password": hashed_password,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.users.insert_one(user_doc)
    
    # Create empty cart
    await db.carts.insert_one({"user_id": user_id, "items": []})
    
    access_token = create_access_token({"sub": user_id})
    
    return TokenResponse(
        access_token=access_token,
        user=UserResponse(
            id=user_id,
            email=user_data.email,
            name=user_data.name,
            created_at=user_doc["created_at"]
        )
    )

@api_router.post("/auth/login", response_model=TokenResponse)
async def login(login_data: UserLogin):
    user = await db.users.find_one({"email": login_data.email})
    if not user or not verify_password(login_data.password, user["password"]):
        raise HTTPException(status_code=401, detail="Hibás email vagy jelszó")
    
    access_token = create_access_token({"sub": user["id"]})
    
    return TokenResponse(
        access_token=access_token,
        user=UserResponse(
            id=user["id"],
            email=user["email"],
            name=user["name"],
            created_at=user["created_at"]
        )
    )

@api_router.get("/auth/me", response_model=UserResponse)
async def get_me(user: dict = Depends(get_current_user)):
    return UserResponse(**user)

# ============= CATEGORY ROUTES =============

@api_router.get("/categories", response_model=List[Category])
async def get_categories():
    categories = await db.categories.find({}, {"_id": 0}).sort("order", 1).to_list(500)
    return categories

@api_router.get("/categories/{slug}")
async def get_category(slug: str):
    category = await db.categories.find_one({"slug": slug}, {"_id": 0})
    if not category:
        raise HTTPException(status_code=404, detail="Kategória nem található")
    return category

# ============= PRODUCT ROUTES =============

@api_router.get("/products", response_model=List[Product])
async def get_products(
    category: Optional[str] = None,
    health_category: Optional[str] = None,
    featured: Optional[bool] = None,
    discounted: Optional[bool] = None,
    search: Optional[str] = None,
    limit: int = 50
):
    query = {}
    
    if category:
        cat = await db.categories.find_one({"slug": category}, {"_id": 0})
        if cat:
            query["category_id"] = cat["id"]
    
    if health_category:
        query["health_category"] = health_category
    
    if featured:
        query["is_featured"] = True
    
    if discounted:
        query["is_discounted"] = True
    
    if search:
        query["name"] = {"$regex": search, "$options": "i"}
    
    products = await db.products.find(query, {"_id": 0}).limit(limit).to_list(limit)
    return products

@api_router.get("/products/{slug}")
async def get_product(slug: str):
    product = await db.products.find_one({"slug": slug}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Termék nem található")
    return product

@api_router.get("/products/id/{product_id}")
async def get_product_by_id(product_id: str):
    product = await db.products.find_one({"id": product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Termék nem található")
    return product

@api_router.get("/category-products/{category_slug}")
async def get_category_products(
    category_slug: str,
    sort: Optional[str] = "default",
    page: int = 1,
    per_page: int = 24,
    price_min: Optional[float] = None,
    price_max: Optional[float] = None,
    search: Optional[str] = None,
    request: Request = None,
):
    cat = await db.categories.find_one({"slug": category_slug}, {"_id": 0})
    if not cat:
        raise HTTPException(status_code=404, detail="Kategória nem található")

    query = {"category_id": cat["id"]}

    if price_min is not None:
        query["price"] = query.get("price", {})
        query["price"]["$gte"] = price_min
    if price_max is not None:
        query["price"] = query.get("price", {})
        query["price"]["$lte"] = price_max
    if search:
        query["name"] = {"$regex": search, "$options": "i"}

    # Attribute filters from query params (attr_brand=BioCo&attr_form=tabletta)
    params = dict(request.query_params) if request else {}
    for key, val in params.items():
        if key.startswith("attr_") and val:
            attr_key = key[5:]
            values = val.split(",")
            query[f"attributes.{attr_key}"] = {"$in": values}

    # Sorting
    sort_field = [("created_at", -1)]
    if sort == "name_asc":
        sort_field = [("name", 1)]
    elif sort == "name_desc":
        sort_field = [("name", -1)]
    elif sort == "price_asc":
        sort_field = [("price", 1)]
    elif sort == "price_desc":
        sort_field = [("price", -1)]

    total = await db.products.count_documents(query)
    skip = (page - 1) * per_page
    products = await db.products.find(query, {"_id": 0}).sort(sort_field).skip(skip).limit(per_page).to_list(per_page)

    # Build facets from ALL products in this category (not filtered ones) for counts
    all_cat_products = await db.products.find({"category_id": cat["id"]}, {"_id": 0, "attributes": 1, "price": 1}).to_list(500)
    facets = {}
    for p in all_cat_products:
        for attr_key, attr_val in p.get("attributes", {}).items():
            if attr_key not in facets:
                facets[attr_key] = {}
            if isinstance(attr_val, list):
                for v in attr_val:
                    facets[attr_key][v] = facets[attr_key].get(v, 0) + 1
            elif isinstance(attr_val, bool):
                label = "Igen" if attr_val else "Nem"
                facets[attr_key][label] = facets[attr_key].get(label, 0) + 1
            else:
                facets[attr_key][str(attr_val)] = facets[attr_key].get(str(attr_val), 0) + 1

    prices = [p["price"] for p in all_cat_products if "price" in p]
    price_range = {"min": min(prices) if prices else 0, "max": max(prices) if prices else 0}

    return {
        "category": cat,
        "products": products,
        "total": total,
        "page": page,
        "per_page": per_page,
        "total_pages": (total + per_page - 1) // per_page,
        "facets": facets,
        "price_range": price_range,
    }

# ============= CART ROUTES =============

@api_router.get("/cart", response_model=CartResponse)
async def get_cart(user: dict = Depends(get_current_user)):
    cart = await db.carts.find_one({"user_id": user["id"]}, {"_id": 0})
    if not cart:
        cart = {"user_id": user["id"], "items": []}
        await db.carts.insert_one(cart)
    
    cart_items = []
    total = 0.0
    
    for item in cart.get("items", []):
        product = await db.products.find_one({"id": item["product_id"]}, {"_id": 0})
        if product:
            subtotal = product["price"] * item["quantity"]
            total += subtotal
            cart_items.append(CartItemResponse(
                product_id=product["id"],
                name=product["name"],
                price=product["price"],
                original_price=product.get("original_price"),
                discount_percent=product.get("discount_percent"),
                image_url=product["image_url"],
                quantity=item["quantity"],
                subtotal=subtotal
            ))
    
    delivery_fee = 0.0 if total >= FREE_DELIVERY_THRESHOLD else 1490.0
    
    return CartResponse(
        items=cart_items,
        total=total,
        delivery_fee=delivery_fee,
        grand_total=total + delivery_fee
    )

@api_router.post("/cart/add")
async def add_to_cart(item: CartItem, user: dict = Depends(get_current_user)):
    product = await db.products.find_one({"id": item.product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Termék nem található")
    
    cart = await db.carts.find_one({"user_id": user["id"]})
    if not cart:
        cart = {"user_id": user["id"], "items": []}
        await db.carts.insert_one(cart)
    
    existing_item = next((i for i in cart.get("items", []) if i["product_id"] == item.product_id), None)
    
    if existing_item:
        await db.carts.update_one(
            {"user_id": user["id"], "items.product_id": item.product_id},
            {"$inc": {"items.$.quantity": item.quantity}}
        )
    else:
        await db.carts.update_one(
            {"user_id": user["id"]},
            {"$push": {"items": {"product_id": item.product_id, "quantity": item.quantity}}}
        )
    
    return {"message": "Termék hozzáadva a kosárhoz"}

@api_router.put("/cart/update")
async def update_cart_item(item: CartItem, user: dict = Depends(get_current_user)):
    if item.quantity <= 0:
        await db.carts.update_one(
            {"user_id": user["id"]},
            {"$pull": {"items": {"product_id": item.product_id}}}
        )
    else:
        await db.carts.update_one(
            {"user_id": user["id"], "items.product_id": item.product_id},
            {"$set": {"items.$.quantity": item.quantity}}
        )
    
    return {"message": "Kosár frissítve"}

@api_router.delete("/cart/remove/{product_id}")
async def remove_from_cart(product_id: str, user: dict = Depends(get_current_user)):
    await db.carts.update_one(
        {"user_id": user["id"]},
        {"$pull": {"items": {"product_id": product_id}}}
    )
    return {"message": "Termék eltávolítva a kosárból"}

@api_router.delete("/cart/clear")
async def clear_cart(user: dict = Depends(get_current_user)):
    await db.carts.update_one(
        {"user_id": user["id"]},
        {"$set": {"items": []}}
    )
    return {"message": "Kosár kiürítve"}

# ============= ORDER ROUTES =============

@api_router.post("/orders", response_model=Order)
async def create_order(order_data: OrderCreate, user: dict = Depends(get_current_user)):
    cart_response = await get_cart(user)
    
    if not cart_response.items:
        raise HTTPException(status_code=400, detail="A kosár üres")
    
    order = Order(
        user_id=user["id"],
        items=[item.model_dump() for item in cart_response.items],
        total=cart_response.total,
        delivery_fee=cart_response.delivery_fee,
        grand_total=cart_response.grand_total,
        shipping_name=order_data.shipping_name,
        shipping_address=order_data.shipping_address,
        shipping_city=order_data.shipping_city,
        shipping_postal_code=order_data.shipping_postal_code,
        shipping_phone=order_data.shipping_phone,
        notes=order_data.notes
    )
    
    await db.orders.insert_one(order.model_dump())
    
    return order

@api_router.get("/orders", response_model=List[Order])
async def get_orders(user: dict = Depends(get_current_user)):
    orders = await db.orders.find({"user_id": user["id"]}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return orders

@api_router.get("/orders/{order_id}")
async def get_order(order_id: str, user: dict = Depends(get_current_user)):
    order = await db.orders.find_one({"id": order_id, "user_id": user["id"]}, {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail="Rendelés nem található")
    return order

# ============= PAYMENT ROUTES =============

@api_router.post("/payments/checkout")
async def create_checkout(checkout_data: CheckoutRequest, request: Request, user: dict = Depends(get_current_user)):
    order = await db.orders.find_one({"id": checkout_data.order_id, "user_id": user["id"]}, {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail="Rendelés nem található")
    
    if order.get("payment_status") == "paid":
        raise HTTPException(status_code=400, detail="A rendelés már ki van fizetve")
    
    host_url = str(request.base_url).rstrip("/")
    webhook_url = f"{host_url}/api/webhook/stripe"
    
    stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)
    
    success_url = f"{checkout_data.origin_url}/checkout/success?session_id={{CHECKOUT_SESSION_ID}}"
    cancel_url = f"{checkout_data.origin_url}/checkout/cancel"
    
    amount = float(order["grand_total"])
    
    checkout_request = CheckoutSessionRequest(
        amount=amount,
        currency="huf",
        success_url=success_url,
        cancel_url=cancel_url,
        metadata={
            "order_id": checkout_data.order_id,
            "user_id": user["id"]
        }
    )
    
    session = await stripe_checkout.create_checkout_session(checkout_request)
    
    # Create payment transaction record
    transaction = PaymentTransaction(
        user_id=user["id"],
        order_id=checkout_data.order_id,
        session_id=session.session_id,
        amount=amount,
        currency="huf",
        status="initiated",
        payment_status="pending",
        metadata={
            "order_id": checkout_data.order_id,
            "user_id": user["id"]
        }
    )
    
    await db.payment_transactions.insert_one(transaction.model_dump())
    
    # Update order with session id
    await db.orders.update_one(
        {"id": checkout_data.order_id},
        {"$set": {"payment_session_id": session.session_id}}
    )
    
    return {"url": session.url, "session_id": session.session_id}

@api_router.get("/payments/status/{session_id}")
async def get_payment_status(session_id: str, request: Request, user: dict = Depends(get_current_user)):
    transaction = await db.payment_transactions.find_one({"session_id": session_id}, {"_id": 0})
    if not transaction:
        raise HTTPException(status_code=404, detail="Tranzakció nem található")
    
    host_url = str(request.base_url).rstrip("/")
    webhook_url = f"{host_url}/api/webhook/stripe"
    
    stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)
    
    status = await stripe_checkout.get_checkout_status(session_id)
    
    # Update transaction and order status
    new_status = "completed" if status.payment_status == "paid" else transaction["status"]
    
    if status.payment_status == "paid" and transaction["payment_status"] != "paid":
        await db.payment_transactions.update_one(
            {"session_id": session_id},
            {"$set": {"status": new_status, "payment_status": status.payment_status}}
        )
        
        await db.orders.update_one(
            {"id": transaction["order_id"]},
            {"$set": {"status": "confirmed", "payment_status": "paid"}}
        )
        
        # Clear cart after successful payment
        await db.carts.update_one(
            {"user_id": user["id"]},
            {"$set": {"items": []}}
        )
    
    return {
        "status": status.status,
        "payment_status": status.payment_status,
        "amount_total": status.amount_total,
        "currency": status.currency
    }

@api_router.post("/webhook/stripe")
async def stripe_webhook(request: Request):
    body = await request.body()
    signature = request.headers.get("Stripe-Signature")
    
    host_url = str(request.base_url).rstrip("/")
    webhook_url = f"{host_url}/api/webhook/stripe"
    
    stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)
    
    try:
        webhook_response = await stripe_checkout.handle_webhook(body, signature)
        
        if webhook_response.payment_status == "paid":
            session_id = webhook_response.session_id
            
            await db.payment_transactions.update_one(
                {"session_id": session_id},
                {"$set": {"status": "completed", "payment_status": "paid"}}
            )
            
            transaction = await db.payment_transactions.find_one({"session_id": session_id}, {"_id": 0})
            if transaction:
                await db.orders.update_one(
                    {"id": transaction["order_id"]},
                    {"$set": {"status": "confirmed", "payment_status": "paid"}}
                )
                
                await db.carts.update_one(
                    {"user_id": transaction["user_id"]},
                    {"$set": {"items": []}}
                )
        
        return {"status": "success"}
    except Exception as e:
        logger.error(f"Webhook error: {e}")
        return {"status": "error", "message": str(e)}

# ============= SEED DATA =============

@api_router.post("/seed")
async def seed_data():
    existing_categories = await db.categories.count_documents({})
    if existing_categories > 0:
        return {"message": "Adatok mar leteznek. Hasznald a /api/reseed endpointot."}
    return await _do_seed()


@api_router.post("/reseed")
async def reseed_data():
    await db.categories.delete_many({})
    await db.products.delete_many({})
    return await _do_seed()


async def _do_seed():
    T = [
        ("cat-100-tisztasagu","100% tisztasagu termekek","100-tisztasagu-termekek","ShieldCheck",True,[]),
        ("cat-mire-keres","Mire keres megoldast?","mire-keres-megoldast","Search",True,[
            ("sub-alvaszavar","Alvaszavar, almatlansag","alvaszavar-almatlansag",[]),
            ("sub-belflora","Belflora, emesztes","belflora-emesztes",[]),
            ("sub-beltisztitas","Beltisztitas, utifumaghej","beltisztitas-utifumaghej",[]),
            ("sub-csontrendszer","Csontrendszer, csontritkulas","csontrendszer-csontritukalas",[]),
            ("sub-fogyokura","Fogyokura, dieta, zsiregetes","fogyokura-dieta-zsiregetes",[
                ("sub2-toman-diet","Toman Diet","toman-diet"),("sub2-luxoya","Luxoya dieta","luxoya-dieta"),
                ("sub2-dotsdiet","DotsDiet dieta","dotsdiet-dieta"),("sub2-szafi","Szafi termekek","szafi-termekek"),
                ("sub2-forpro","Forpro dieta","forpro-dieta"),]),
            ("sub-gyulladascsokk","Gyulladascsoekkentes","gyulladascsoekkentes",[]),
            ("sub-hugyutak","Hugyutak egeszsege","hugyutak-egeszsege",[]),
            ("sub-immunerosites","Immunerosites","immunerosites",[]),
            ("sub-izuletek","Izuletek, Porcok","izuletek-porcok",[]),
            ("sub-koleszterin","Koleszterinszint","koleszterinszint",[]),
            ("sub-memoria","Memoria, agymukodes","memoria-agymukodes",[]),
            ("sub-meregtelenites","Meregtelenites","meregtelenites",[]),
            ("sub-pajzsmirigy","Pajzsmirigy mukodes","pajzsmirigy-mukodes",[]),
            ("sub-potencia","Potencianoveles","potencianoveles",[]),
            ("sub-prosztata","Prosztata egeszsege","prosztata-egeszsege",[]),
            ("sub-stresszoldas","Stresszoldas, idegrendszer","stresszoldas-idegrendszer",[]),
            ("sub-sziv-er","Sziv es errendszer","sziv-es-errendszer",[]),
            ("sub-frissesseg","Testi es szellemi frissesseg","testi-es-szellemi-frissesseg",[]),
            ("sub-valtozkor","Valtozokor, noi problemak","valtozokor-noi-problemak",[]),
            ("sub-vercukor","Vercukorszint","vercukorszint",[]),
            ("sub-verkeriges","Verkeringes, errendszer","verkeringes-errendszer",[]),
            ("sub-visszar","Visszer, aranyer","visszar-aranyer",[]),
            ("sub-virus","Virus, bakterium, gomba","virus-bakterium-gomba",[]),]),
        ("cat-specialis","Specialis hatoanyagok","specialis-hatoanyagok","FlaskConical",False,[
            ("sub-alfa-lipon","Alfa-liponsav","alfa-liponsav",[]),("sub-astaxanthin","Astaxanthin","astaxanthin",[]),
            ("sub-beta-glukan","Beta-Glukan","beta-glukan",[]),("sub-colostrum","Colostrum","colostrum",[]),
            ("sub-d-mannoz","D-Mannoz","d-mannoz",[]),("sub-diozmin","Diozmin Heszperidin","diozmin-heszperidin",[]),
            ("sub-emesztoenzimek","Emesztoenzimek","emesztoenzimek",[]),("sub-glutation","Glutation","glutation",[]),
            ("sub-glukozamin","Glukozamin","glukozamin",[]),("sub-gymnema","Gymnema Sylvestre","gymnema-sylvestre",[]),
            ("sub-inozitol-spec","Inozitol, Myo-Inositol","inozitol-myo-inositol",[]),
            ("sub-kondroitin","Kondroitin","kondroitin",[]),("sub-melatonin","Melatonin","melatonin",[]),
            ("sub-msm","MSM","msm",[]),("sub-quercetin","Quercetin, Kvercetin","quercetin-kvercetin",[]),
            ("sub-rezveratrol","Rezveratrol","rezveratrol-resveratrol",[]),
            ("sub-zoldkagylo","Uj-Zelandi zoldkagylo","uj-zelandi-zoldkagylo",[]),("sub-zeaxanthin","Zeaxanthin","zeaxanthin",[]),]),
        ("cat-hazipatika","Hazipatika","hazipatika","BriefcaseMedical",False,[
            ("sub-allergia","Allergia","allergia",[]),("sub-borirritaciok","Borirritaciok, ekcema","borirritaciok-ekcema",[]),
            ("sub-ezustkolloid","Ezustkolloid","ezustkolloid",[]),("sub-forro-italporok","Forro italporok","forro-italporok",[]),
            ("sub-fulspray","Fulspray","fulspray",[]),("sub-influenza","Influenza, megfazas, natha","influenza-megfazas-natha",[]),
            ("sub-kohoges","Kohoges csillapitas","kohoges-csillapitas",[]),("sub-orrspray","Orrspray","orrspray",[]),
            ("sub-sebek","Sebek es csipesek","sebek-es-csipesek",[]),("sub-szemcseppek","Szemcseppek","szemcseppek",[]),
            ("sub-szemolcs","Szemolcs, tyukszem","szemolcs-tyukszem-pattanas",[]),
            ("sub-szopogato","Szopogato tablettak","szopogato-tablettak-pasztillak",[]),
            ("sub-talpbetetek","Talpbetetek","talpbetetek",[]),("sub-torokspray","Torokspray es szajspray","torokspray-es-szajspray",[]),]),
        ("cat-vitaminok","Vitaminok","vitaminok","Pill",False,[
            ("sub-a-vitamin","A-vitamin","a-vitamin",[]),
            ("sub-b-vitamin","B-vitamin","b-vitamin",[
                ("sub2-b-komplex","B-komplex","b-komplex"),("sub2-b1","B1-vitamin","b1-vitamin-tiamin"),
                ("sub2-b2","B2-vitamin","b2-vitamin-riboflavin"),("sub2-b3","B3-vitamin","b3-vitamin-niacin"),
                ("sub2-b5","B5-vitamin","b5-vitamin-pantotensav"),("sub2-b6","B6-vitamin","b6-vitamin-piridoxin"),
                ("sub2-b7","B7-vitamin Biotin","b7-vitamin-biotin"),("sub2-b9","B9-vitamin Folsav","b9-vitamin-folsav"),
                ("sub2-b12","B12-vitamin","b12-vitamin"),("sub2-inozitol-b","Inozitol","b-vitamin-inozitol"),
                ("sub2-kolin","Kolin","kolin"),]),
            ("sub-c-vitamin","C-vitamin","c-vitamin",[
                ("sub2-c-csepp","C-vitamin csepp","c-vitamin-csepp"),("sub2-c-kapszula","C-vitamin kapszula","c-vitamin-kapszula"),
                ("sub2-c-pezsg","C-vitamin pezsgotabletta","c-vitamin-pezsgotabletta"),("sub2-c-por","C-vitamin por","c-vitamin-por"),
                ("sub2-c-rago","C-vitamin ragotabletta","c-vitamin-ragotabletta"),("sub2-c-tabletta","C-vitamin tabletta","c-vitamin-tabletta"),
                ("sub2-c-500","C-vitamin 500mg","c-vitamin-500mg"),("sub2-c-1000","C-vitamin 1000mg","c-vitamin-1000mg"),
                ("sub2-c-1500","C-vitamin 1500mg","c-vitamin-1500mg"),]),
            ("sub-cd3","C+D3-vitamin","c-d3-vitamin",[]),
            ("sub-d-vitamin","D-vitamin","d-vitamin",[
                ("sub2-d-csepp","D-vitamin csepp","d-vitamin-csepp"),("sub2-d-kapszula","D-vitamin kapszula","d-vitamin-kapszula"),
                ("sub2-d-rago","D-vitamin ragotabletta","d-vitamin-ragotabletta"),("sub2-d-spray","D-vitamin spray","d-vitamin-spray"),
                ("sub2-d-tabletta","D-vitamin tabletta","d-vitamin-tabletta"),("sub2-d-2000","D-vitamin 2000NE","d-vitamin-2000ne"),
                ("sub2-d-3000","D-vitamin 3000NE","d-vitamin-3000ne"),("sub2-d-4000","D-vitamin 4000NE","d-vitamin-4000ne"),]),
            ("sub-e-vitamin","E-vitamin","e-vitamin",[]),("sub-k-vitamin","K-vitamin","k-vitamin",[]),
            ("sub-k2d3","K2+D3-vitamin","k2-d3-vitamin",[]),("sub-q10","Q10 Koenzim","q10-koenzim",[]),
            ("sub-multivitamin","Multivitaminok","multivitaminok",[
                ("sub2-multi-csomag","Multivitamin csomagok","multivitamin-csomagok"),
                ("sub2-multi-gyerek","Multivitamin gyerekeknek","multivitamin-gyerekeknek"),
                ("sub2-multi-felnott","Multivitamin felnotteknek","multivitamin-felnotteknek"),
                ("sub2-multi-kismama","Multivitamin kismamaknak","multivitamin-kismamaknak"),
                ("sub2-multi-50","Multivitamin 50+","multivitamin-50-felettieknek"),]),
            ("sub-liposzomas","Liposzomas vitaminok","liposzomas-vitaminok",[]),
            ("sub-hajvitamin","Hajvitamin","hajvitamin",[]),("sub-szepsegvitamin","Szepsegvitamin","szepsegvitamin",[]),
            ("sub-szemvitamin","Szemvitamin, lutein","szemvitamin-lutein",[]),("sub-hazi-kedvenc","Hazi kedvenceknek","hazi-kedvenceknek",[]),]),
        ("cat-aminosavak","Aminosavak","aminosavak","Atom",False,[
            ("sub-aminosav-komplex","Aminosav komplex","aminosav-komplex",[]),("sub-arginin","Arginin","arginin-l-arginine",[]),
            ("sub-bcaa","BCAA","bcaa-leucin-isoleucin-valin",[]),("sub-glicin","Glicin","glicin-glycine",[]),
            ("sub-glutamin","Glutamin","glutamin-l-glutamine",[]),("sub-kreatin","Kreatin","kreatin-creatine",[]),
            ("sub-l-karnitin","L-karnitin","l-karnitin-l-carnitine",[]),("sub-lizin","Lizin","lizin-l-lysine",[]),
            ("sub-nac","NAC","n-acetil-l-cisztein-nac",[]),("sub-taurin","Taurin","taurin-l-taurine",[]),
            ("sub-teanin","Teanin","teanin-l-theanine",[]),("sub-tirozin","Tirozin","tirozin-l-tyrosine",[]),
            ("sub-triptofan","Triptofan","triptofan-l-tryptophan",[]),]),
        ("cat-gyogygombak","Gyogygombak","gyogygombak","TreeDeciduous",False,[
            ("sub-cordyceps","Cordyceps","cordyceps-kinai-hernyogomba",[]),("sub-fafulgomba","Fafulgomba","fafulgomba-judasfule-gomba",[]),
            ("sub-ganoderma","Ganoderma","ganoderma-pecsetviaszgomba",[]),("sub-maitake","Maitake","maitake-bokrosgomba",[]),
            ("sub-shiitake","Shiitake","shiitake",[]),("sub-sungomba","Sungomba","sungomba",[]),]),
        ("cat-gyogynovenyek","Gyogynovenyek","gyogynovenyek","Sprout",False,[
            ("sub-superfood","Superfood","superfood",[]),("sub-flavonoidok","Flavonoidok","flavonoidok",[]),
            ("sub-cbd","CBD","cbd",[]),("sub-acai","Acai","acai",[]),("sub-aloe-vera","Aloe vera","aloe-vera",[]),
            ("sub-ananasz","Ananasz","ananasz",[]),("sub-aranygyoker","Aranygyoker","aranygyoker-rhodiola-rosea",[]),
            ("sub-articsoka","Articsoka","articsoka",[]),("sub-ashwagandha","Ashwagandha","ashwagandha",[]),
            ("sub-baratcserje","Baratcserje","baratcserje",[]),("sub-bodza","Bodza","bodza",[]),
            ("sub-borsmenta","Borsmenta","borsmenta",[]),("sub-brokkoli","Brokkoli","brokkoli",[]),
            ("sub-bodorrozsa","Bodorrozsa","bodorrozsa",[]),("sub-buzafu","Buzafu","buzafu",[]),
            ("sub-cekla","Cekla","cekla",[]),("sub-chia-mag","Chia mag","chia-mag",[]),
            ("sub-citromfu","Citromfu","citromfu",[]),("sub-csipkebogyo","Csipkebogyo","csipkebogyo",[]),
            ("sub-echinacea","Echinacea","echinacea",[]),("sub-fahej","Fahej","fahej",[]),
            ("sub-fekete-afonya","Fekete Afonya","fekete-afonya",[]),("sub-feketekomeny","Feketekomeny","feketekomeny",[]),
            ("sub-fokhagyma","Fokhagyma","fokhagyma",[]),("sub-fureszpalma","Fureszpalma","fureszpalma-szabalpalma",[]),
            ("sub-galagonya","Galagonya","galagonya",[]),("sub-ginkgo","Ginkgo Biloba","ginkgo-biloba",[]),
            ("sub-ginzeng","Ginzeng","ginzeng",[]),("sub-goji","Goji","goji",[]),("sub-gotu-kola","Gotu kola","gotu-kola",[]),
            ("sub-granatalma","Granatalma","granatalma",[]),("sub-grapefruitm","Grapefruitmag","grapefruitmag",[]),
            ("sub-guarana","Guarana","guarana",[]),("sub-gyomber","Gyomber","gyomber",[]),
            ("sub-homoktovis","Homoktovis","homoktovis",[]),("sub-izlandi-zuzmo","Izlandi zuzmo","izlandi-zuzmo",[]),
            ("sub-kakukkfu","Kakukkfu","kakukkfu",[]),("sub-kapor","Kapor","kapor",[]),("sub-kender","Kender","kender",[]),
            ("sub-kurkuma","Kurkuma","kurkuma",[]),("sub-kudzu","Kudzu-gyoker","kudzu-gyoker",[]),
            ("sub-landzsa-utifu","Landzsas utifu","landzsas-utifu",[]),("sub-levendula","Levendula","levendula",[]),
            ("sub-maca","Maca","maca",[]),("sub-mariatovis","Mariatovis","mariatovis",[]),("sub-noni","Noni","noni",[]),
            ("sub-olajfalevel","Olajfalevel","olajfalevel",[]),("sub-ordognyelv","Ordognyelv","ordognyelv-glucomannan",[]),
            ("sub-papaya","Papaya","papaya",[]),("sub-szolomag","Szolomag","szolomag",[]),("sub-teafaolaj","Teafaolaj","teafaolaj",[]),
            ("sub-tozegafonya","Tozegafonya","tozegafonya-vorosafoya",[]),("sub-vadgesztenye","Vadgesztenye","vadgesztenye",[]),
            ("sub-valeriana","Valeriana","valeriana-macsagyoker",[]),("sub-utifu-maghej","Utifu maghej","utifu-maghej",[]),
            ("sub-zold-kave","Zold kave","zold-kave",[]),("sub-zold-tea","Zold Tea","zold-tea",[]),]),
        ("cat-ayurveda","Ayurveda keszitmenyek","ayurveda-keszitmenyek","Flower2",False,[
            ("sub-amla","Amla","amla",[]),("sub-boswellia","Boswellia","boswellia",[]),("sub-brahmi","Brahmi","brahmi",[]),
            ("sub-guggul","Guggul","guggul",[]),("sub-haritaki","Haritaki","haritaki",[]),("sub-moringa","Moringa","moringa",[]),
            ("sub-neem","Neem","neem",[]),("sub-shatavari","Shatavari","shatavari",[]),
            ("sub-shilajit","Shilajit, mumijo","shilajit-mumijo",[]),("sub-triphala","Triphala","triphala",[]),
            ("sub-tulsi","Tulsi","tulsi",[]),]),
        ("cat-asvanyi","Asvanyi anyagok","asvanyi-anyagok","Gem",False,[
            ("sub-mag-b6","Magnezium+B6","magnezium-b6-vitamin",[]),
            ("sub-cink","Cink","cink",[("sub2-cink-biszg","Cink-biszglicinat","cink-biszglicinat"),("sub2-cink-citrat","Cink-citrat","cink-citrat"),("sub2-cink-glukonat","Cink-glukonat","cink-glukonat")]),
            ("sub-jod","Jod","jod",[]),
            ("sub-kalcium","Kalcium","kalcium",[("sub2-kalcium-biszg","Kalcium-biszglicinat","kalcium-biszglicinat"),("sub2-kalcium-citrat","Kalcium-citrat","kalcium-citrat")]),
            ("sub-kalium","Kalium","kalium",[]),("sub-krom","Krom","krom",[]),
            ("sub-magnezium","Magnezium","magnezium",[("sub2-mag-biszg","Magnezium-biszglicinat","magnezium-biszglicinat"),("sub2-mag-citrat","Magnezium-citrat","magnezium-citrat")]),
            ("sub-szelen","Szelen","szelen",[]),("sub-vas","Vas","vas",[]),("sub-multi-mineral","Multi Mineral komplex","multi-mineral-komplex",[]),]),
        ("cat-mikrobiom","Mikrobiom, eloflora","mikrobiom-eloflora","Bug",False,[]),
        ("cat-feherjek","Feherjek, proteinek","feherjek-proteinek","Dumbbell",False,[
            ("sub-izesitett-feherje","Izesitett feherjepor","izesitett-feherjepor",[]),
            ("sub-natur-vegan","Natur es Vegan feherjepor","natur-vegan-feherjepor",[]),
            ("sub-protein-szelet","Protein szelet","protein-szelet",[]),("sub-shaker","Shaker","shaker",[]),]),
        ("cat-kollagen","Kollagen es Hialuron","kollagen-es-hialuron","Droplets",False,[
            ("sub-hialuronsav","Hialuronsav","hialuronsav",[]),("sub-kollagen-ampulla","Kollagen ampulla","kollagen-ampulla",[]),
            ("sub-kollagen-ital","Kollagen ital","kollagen-ital",[]),("sub-kollagen-por","Kollagen por","kollagen-por",[]),
            ("sub-kollagen-tabletta","Kollagen tabletta","kollagen-tabletta",[]),
            ("sub-marhakollagen","Marhakollagen","marhakollagen",[]),("sub-halkollagen","Halkollagen","halkollagen",[]),
            ("sub-serteskollagen","Serteskollagen","serteskollagen",[]),]),
        ("cat-propolisz","Propolisz, mehpempo","propolisz-mehpempo","Flower",False,[
            ("sub-mehkenyer","Mehkenyer","mehkenyer",[]),("sub-mehpempo","Mehpempo","mehpempo",[]),
            ("sub-mez","Mez","mez",[]),("sub-propolisz-item","Propolisz","propolisz",[]),("sub-viragpor","Viragpor","viragpor",[]),]),
        ("cat-omega","Omega 3-6-9 es Lecitin","omega-3-6-9-es-lecitin","Fish",False,[
            ("sub-borago","Borago olaj","borago-olaj",[]),("sub-capamaj","Capamaj","capamaj-csukamajolaj",[]),
            ("sub-feketekomenymag-olaj","Feketekomenymag olaj","feketekomenymag-olaj",[]),
            ("sub-halolaj","Halolaj","halolaj",[]),("sub-krill","Krill rakolaj","krill-rakolaj",[]),
            ("sub-lazacolaj","Lazacolaj","lazacolaj",[]),("sub-lecitin","Lecitin","lecitin",[]),
            ("sub-lenmagolaj","Lenmagolaj","lenmagolaj",[]),("sub-ligetszpe","Ligetszpe olaj","ligetszpe-olaj",[]),]),
        ("cat-spirulina","Spirulina, Chlorella alga","spirulina-chlorella-alga","Waves",False,[]),
        ("cat-teak","Gyogynoveny es elvezeti teak","gyogynoveny-es-elvezeti-teak","Coffee",False,[
            ("sub-teavalogatások","Teavalogatások","teavalgatok",[]),("sub-yogi","Yogi teak","yogi-teak",[]),
            ("sub-ukko","Ukko teak","ukko-teak",[]),("sub-herbaria-teli","Herbaria Teli varazs","herbaria-teli-varazs",[]),
            ("sub-gardonyi","Gardonyi Teahaz","gardonyi-teahaz-teak",[]),("sub-apotheke","Apotheke gyumolcsteak","apotheke-gyumolcsteak",[]),
            ("sub-teekanne","Teekanne teak","teekanne-teak",[]),("sub-naturland-gyum","Naturland gyumolcstea","naturland-gyumolcstea",[]),
            ("sub-naturland-gyogy","Naturland gyogynovenytea","naturland-gyogynovenytea",[]),
            ("sub-naturland-funk","Naturland funkcionalis tea","naturland-funkcionalis-tea",[]),
            ("sub-mecsek-gyum","Mecsek gyumolcstea","mecsek-gyumolcstea",[]),
            ("sub-mecsek-gyogy","Mecsek gyogynovenytea","mecsek-gyogynovenytea",[]),
            ("sub-baba-mama-tea","Baba-Mama tea","baba-mama-tea",[]),
            ("sub-filteres-gyumolcs","Filteres gyumolcs teak","filteres-gyumolcs-es-fekete-teak",[]),
            ("sub-filteres-gyogy","Filteres gyogynoveny teak","filteres-gyogynoveny-teak",[]),
            ("sub-szalas-gyogy","Szalas gyogynoveny teak","szalas-gyogynoveny-teak",[]),
            ("sub-szalas-gyumolcs","Szalas gyumolcs teak","szalas-gyumolcs-es-fekete-teak",[]),]),
        ("cat-kremek-olajok","Gyogynoveny kremek es olajok","gyogynoveny-kremek-es-olajok","Pipette",False,[
            ("sub-arnika","Arnika krem","arnika-krem",[]),("sub-fekete-nadalyto","Fekete nadalyto krem","fekete-nadalyto-krem",[]),
            ("sub-kamilla-krem","Kamilla krem","kamilla-krem",[]),("sub-koromvirag","Koromvirag krem","koromvirag-krem",[]),
            ("sub-levendula-krem","Levendula krem","levendula-krem",[]),("sub-ordogcsaklya","Ordogcsaklya krem","ordogcsaklya-krem",[]),
            ("sub-rozmaring","Rozmaring krem","rozmaring-krem",[]),
            ("sub-fajdalomcsill","Fajdalomcsillapito kremek","fajdalomcsillapito-rheuma-kremek",[]),
            ("sub-izomlazito","Izomlazito kremek","izomlazito-es-sportkremek",[]),
            ("sub-vadgeszt-krem","Vadgesztenye kremek","vadgesztenye-kremek",[]),
            ("sub-visszar-kremek","Visszer elleni kremek","visszar-elleni-kremek",[]),]),
        ("cat-naturkozmetikum","Naturkozmetikumok, illoolajok","naturkozmetikumok-illoolajok","Sparkles",False,[
            ("sub-intim-termek","Noi/ferfi intim termekek","noi-ferfi-intim-termekek",[]),
            ("sub-okohaztartas","Okohaztartas","okohaztartas",[]),("sub-illoolajok","Illoolajok","illoolajok-aromaterapia",[]),
            ("sub-ajakapolok","Ajakapolok","ajakapolok",[]),("sub-arcapolok","Arcapolok","arcapolok",[]),
            ("sub-babaapolas","Babaapolas","babaapolas",[]),("sub-ferfi-kozm","Ferfi kozmetikumok","ferfi-kozmetikumok",[]),
            ("sub-fog-szajapolas","Fog- es szajapolok","fog-es-szajapolok",[]),("sub-hajapolok","Hajapolok","hajapolok",[]),
            ("sub-hajbalzsamok","Hajbalzsamok","hajbalzsamok",[]),("sub-hajfestekek","Hajfestekek","hajfestekek",[]),
            ("sub-hajsamponok","Hajsamponok","hajsamponok",[]),("sub-illatszerek","Illatszerek","illatszerek",[]),
            ("sub-kez-korom-lab","Kez-, korom-, labapolas","kez-korom-labapolas",[]),("sub-szappanok","Szappanok","szappanok",[]),
            ("sub-testapolok","Testapolok","testapolok",[]),("sub-tusfurdok","Tusfurdok, habfurdok","tusfurdok-habfurdok",[]),
            ("sub-napozovitamin","Napozovitamin","napozovitamin-napozo-spray",[]),]),
        ("cat-bio-reform","Bio es reformelelmiszerek","bio-es-reformelelmiszerek","Wheat",False,[
            ("sub-alapanyagok","Alapanyagok","alapanyagok-poralapok",[]),("sub-aszalt-gyumolcs","Aszalt gyumolcsok","aszalt-liofilizalt-gyumolcsok",[]),
            ("sub-cukrok","Cukrok, edesitoszerek","cukrok-edesitoszerek",[]),("sub-edessegek","Edes es sos edessegek","edes-es-sos-edessegek",[]),
            ("sub-fuszerek","Fuszerek","fuszerek",[]),("sub-gabonok","Gabonak, rizs","gabonak-algabonak-rizs",[]),
            ("sub-granola","Granola, muzli","granola-muzli-kasa-pehely",[]),("sub-huvelyesek","Huvelyesek","huvelyesek",[]),
            ("sub-kave-kakao","Kave, kakao, szorp","kave-kakao-szorp",[]),("sub-kenyer","Kenyer","kenyer-es-kenyerhelyettesitok",[]),
            ("sub-lisztek","Lisztek","lisztek",[]),("sub-magvak","Magvak, magkremek","magvak-magkremek",[]),
            ("sub-olajok-bio","Olajok","olajok",[]),("sub-so","So","so",[]),("sub-szoszok","Szoszok, lekvarok","szoszok-lekvarok",[]),
            ("sub-tejhelyettesitok","Tejhelyettesitok","tejhelyettesitok",[]),("sub-tesztak","Tesztak","tesztak",[]),]),
        ("cat-naturcleaning","NaturCleaning","naturcleaning","Droplet",False,[]),
    ]

    order = 0
    cat_count = 0
    for cat_id, name, slug, icon, highlighted, children in T:
        await db.categories.insert_one({"id": cat_id, "name": name, "slug": slug, "icon": icon, "parent_id": None, "order": order})
        order += 1
        cat_count += 1
        for sub in children:
            sub_id, sub_name, sub_slug = sub[0], sub[1], sub[2]
            grandchildren = sub[3] if len(sub) > 3 else []
            await db.categories.insert_one({"id": sub_id, "name": sub_name, "slug": sub_slug, "parent_id": cat_id, "order": order})
            order += 1
            cat_count += 1
            for gc in grandchildren:
                gc_id, gc_name, gc_slug = gc[0], gc[1], gc[2]
                await db.categories.insert_one({"id": gc_id, "name": gc_name, "slug": gc_slug, "parent_id": sub_id, "order": order})
                order += 1
                cat_count += 1

    sample_products = [
        Product(id="p-1", name="D3-vitamin 4000 NE kapszula (120db)", slug="d3-vitamin-4000ne-120db",
            description="Magas dozisu D3-vitamin.", price=3490, original_price=4290, discount_percent=19,
            image_url="https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400",
            category_id="cat-vitaminok", is_featured=True, is_discounted=True, attributes={"brand":"VitaKing","form":"kapszula"}),
        Product(id="p-2", name="C-vitamin 1000mg csipkebogyoval (60db)", slug="c-vitamin-1000mg-60db",
            description="C-vitamin csipkebogyo kivonattal.", price=2990, original_price=3990, discount_percent=25,
            image_url="https://images.unsplash.com/photo-1550572017-edd951aa8f72?w=400",
            category_id="cat-vitaminok", is_featured=True, is_discounted=True, attributes={"brand":"BioCo","form":"tabletta"}),
        Product(id="p-3", name="Magnezium-biszglicinat + B6 (90db)", slug="magnezium-biszglicinat-b6-90db",
            description="Magnezium B6-vitaminnal.", price=6599, original_price=7999, discount_percent=18,
            image_url="https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400",
            category_id="cat-asvanyi", is_featured=True, is_discounted=True, attributes={"brand":"BioCo","form":"tabletta"}),
        Product(id="p-4", name="Ashwagandha KSM-66 kapszula (60db)", slug="ashwagandha-ksm66-60db",
            description="Ashwagandha kivonat.", price=5490, original_price=6490, discount_percent=15,
            image_url="https://images.unsplash.com/photo-1556740758-90de374c12ad?w=400",
            category_id="cat-gyogynovenyek", is_featured=True, is_discounted=True, attributes={"brand":"Herbaria","form":"kapszula"}),
        Product(id="p-5", name="Omega-3 Halolaj 1000mg (120db)", slug="omega-3-halolaj-1000mg-120db",
            description="Halolaj EPA es DHA tartalommal.", price=5490, original_price=6990, discount_percent=21,
            image_url="https://images.unsplash.com/photo-1556306535-38febf6782e7?w=400",
            category_id="cat-omega", is_featured=True, is_discounted=True, attributes={"brand":"VitaKing","form":"kapszula"}),
        Product(id="p-6", name="Kollagen peptidek 10000mg (30 adag)", slug="kollagen-peptidek-10000mg-30adag",
            description="Tengeri kollagen.", price=8990, original_price=10990, discount_percent=18,
            image_url="https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400",
            category_id="cat-kollagen", is_featured=True, is_discounted=True, attributes={"brand":"Naturland","form":"por"}),
        Product(id="p-7", name="Probiotikum 10 torzs (30db)", slug="probiotikum-10-torzs-30db",
            description="10 milliard CFU.", price=4790, original_price=5790, discount_percent=17,
            image_url="https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=400",
            category_id="cat-mikrobiom", is_featured=True, is_discounted=True, attributes={"brand":"Naturland","form":"kapszula"}),
        Product(id="p-8", name="Shiitake gomba kapszula (60db)", slug="shiitake-gomba-60db",
            description="Shiitake gomba kivonat.", price=4990,
            image_url="https://images.unsplash.com/photo-1515023115689-589c33041d3c?w=400",
            category_id="cat-gyogygombak", is_featured=True, attributes={"brand":"VitaKing","form":"kapszula"}),
        Product(id="p-9", name="Propolisz csepp 30ml", slug="propolisz-csepp-30ml",
            description="Propolisz kivonat.", price=3290,
            image_url="https://images.unsplash.com/photo-1585435557343-3b092031a831?w=400",
            category_id="cat-propolisz", is_featured=True, attributes={"brand":"Herbaria","form":"csepp"}),
        Product(id="p-10", name="Kreatin Monohidrat 300g", slug="kreatin-monohidrat-300g",
            description="Kreatin por.", price=4490, original_price=5490, discount_percent=18,
            image_url="https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=400",
            category_id="cat-feherjek", is_featured=True, is_discounted=True, attributes={"brand":"Scitec","form":"por"}),
    ]

    for prod in sample_products:
        await db.products.insert_one(prod.model_dump())

    return {"message": f"Sikeresen feltoltve: {cat_count} kategoria, {len(sample_products)} minta termek"}


# ============= HYBRID CATEGORY ROUTES (Mongo tree + Shopify products) =============

from shopify_api import _gql, COLLECTION_BY_HANDLE, _transform_product

SEARCH_PRODUCTS_QUERY = """
query($q: String!, $first: Int!, $after: String, $sortKey: SearchSortKeys, $reverse: Boolean) {
  search(query: $q, first: $first, after: $after, types: PRODUCT, sortKey: $sortKey, reverse: $reverse) {
    edges {
      node {
        ... on Product {
          id
          title
          handle
          description
          availableForSale
          productType
          vendor
          tags
          priceRange {
            minVariantPrice { amount currencyCode }
            maxVariantPrice { amount currencyCode }
          }
          compareAtPriceRange {
            minVariantPrice { amount currencyCode }
          }
          featuredImage { url altText }
          variants(first: 5) {
            edges {
              node {
                id
                title
                availableForSale
                price { amount currencyCode }
                compareAtPrice { amount currencyCode }
              }
            }
          }
        }
      }
    }
    pageInfo { hasNextPage endCursor }
  }
}
"""

@api_router.get("/category-tree")
async def get_category_tree():
    cats = await db.categories.find({}, {"_id": 0}).sort("order", 1).to_list(1000)
    by_parent = {}
    for c in cats:
        by_parent.setdefault(c.get("parent_id"), []).append(c)

    def build(parent_id):
        return [{
            "id": c["id"],
            "title": c["name"],
            "handle": c["slug"],
            "icon": c.get("icon"),
            "children": build(c["id"]),
        } for c in by_parent.get(parent_id, [])]

    return {"items": build(None)}


def _descendant_names(cat_id, by_parent, depth=0):
    names = []
    if depth >= 3:
        return names
    for c in by_parent.get(cat_id, []):
        names.append(c["name"])
        names.extend(_descendant_names(c["id"], by_parent, depth + 1))
    return names


@api_router.get("/categories/{slug}/products")
async def get_category_products_hybrid(
    slug: str,
    first: int = 24,
    after: Optional[str] = None,
    sort: Optional[str] = None,
    reverse: bool = False,
):
    sort_key = sort.upper() if sort else None

    # 1) Try native Shopify collection by handle
    data = await _gql(COLLECTION_BY_HANDLE, {
        "handle": slug, "first": first, "after": after,
        "sortKey": sort_key, "reverse": reverse,
    })
    collection = data.get("collection")
    if collection:
        products = [_transform_product(e["node"]) for e in collection.get("products", {}).get("edges", [])]
        return {
            "source": "collection",
            "collection": {
                "id": collection["id"],
                "title": collection["title"],
                "handle": collection["handle"],
                "description": collection.get("description", ""),
                "image_url": collection.get("image", {}).get("url") if collection.get("image") else None,
            },
            "products": products,
            "pageInfo": collection.get("products", {}).get("pageInfo", {}),
            "filters": collection.get("products", {}).get("filters", []),
        }

    # 2) Fallback: Mongo category -> Shopify product search by name(s)
    cat = await db.categories.find_one({"slug": slug}, {"_id": 0})
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found")

    all_cats = await db.categories.find({}, {"_id": 0, "id": 1, "name": 1, "parent_id": 1}).to_list(1000)
    by_parent = {}
    for c in all_cats:
        by_parent.setdefault(c.get("parent_id"), []).append(c)

    terms = [cat["name"]] + _descendant_names(cat["id"], by_parent)
    words, seen = [], set()
    for t in terms:
        for w in re.split(r"[^a-zA-Záéíóöőúüű]+", t.lower()):
            if len(w) >= 4 and w not in seen:
                seen.add(w)
                words.append(w)
    query = " OR ".join(words[:8]) or cat["name"]

    search_sort = "PRICE" if sort_key == "PRICE" else "RELEVANCE"
    data = await _gql(SEARCH_PRODUCTS_QUERY, {
        "q": query, "first": first, "after": after,
        "sortKey": search_sort, "reverse": reverse,
    })
    edges = data.get("search", {}).get("edges", [])
    products = [_transform_product(e["node"]) for e in edges if e.get("node")]
    return {
        "source": "search",
        "collection": {
            "id": cat["id"],
            "title": cat["name"],
            "handle": cat["slug"],
            "description": "",
            "image_url": None,
        },
        "products": products,
        "pageInfo": data.get("search", {}).get("pageInfo", {}),
        "filters": [],
    }


# ============= ROOT ROUTES =============

@api_router.get("/")
async def root():
    return {"message": "Arvoalux Vitamin Webshop API"}

@api_router.get("/health")
async def health():
    return {"status": "healthy"}

# Include Shopify Storefront API routes
from shopify_api import router as shopify_router
api_router.include_router(shopify_router)

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
