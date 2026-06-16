import type { Brand } from "../types";
import { getCart } from "../cart";
import { formatPrice } from "../shopify";

export async function CartPage({ brand }: { brand: Brand }) {
  const cart = await getCart(brand.handle);

  if (!cart || cart.totalQuantity === 0) {
    return (
      <main>
        <h1 className="section-title">Kosár</h1>
        <p className="empty">
          A kosarad üres. <a href="/">Vissza a termékekhez →</a>
        </p>
      </main>
    );
  }

  return (
    <main>
      <h1 className="section-title">Kosár — {brand.name}</h1>
      {cart.lines.nodes.map((line) => (
        <div key={line.id} className="cart-line">
          <span>
            {line.quantity} × {line.merchandise.product.title}
            {line.merchandise.title !== "Default Title" ? ` (${line.merchandise.title})` : ""}
          </span>
          <span className="price">
            {formatPrice(
              String(Number(line.merchandise.price.amount) * line.quantity),
              line.merchandise.price.currencyCode
            )}
          </span>
        </div>
      ))}
      <div className="cart-total">
        <span>Összesen</span>
        <span>{formatPrice(cart.cost.totalAmount.amount, cart.cost.totalAmount.currencyCode)}</span>
      </div>
      <a className="btn" href={cart.checkoutUrl}>Tovább a fizetéshez</a>
    </main>
  );
}
