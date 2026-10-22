import 'server-only';
import {cookies} from 'next/headers';
import {createHash,randomBytes} from 'node:crypto';
import {Client} from 'ssh2';
const domains:Record<string,string>={arvoalux:'arvoalux.hu',biobarat:'biobarat.eu',boltbio:'boltbio.hu',nagykervitamin:'nagykervitamin.hu',napivitamin:'napivitamin.eu',nutrimarket:'nutrimarket.hu',prevenciobolt:'prevenciobolt.hu',provitaminok:'provitaminok.hu',unipatikatt:'unipatikatt.hu'};
export async function broker(request:Record<string,unknown>):Promise<any>{
 return new Promise((resolve,reject)=>{
  let client:Client|undefined,done=false,attempt=0;
  const timer=setTimeout(()=>finish(new Error('BROKER_OUTCOME_UNKNOWN')),65000);
  function finish(error:Error|null,value?:unknown){if(done)return;done=true;clearTimeout(timer);client?.end();error?reject(error):resolve(value);}
  function connect(){
   if(done)return;attempt++;const connection=new Client();client=connection;let ready=false;
   connection.on('error',(error:any)=>{
    if(done||client!==connection)return;
    const timeout=error?.level==='client-timeout'||error?.code==='ETIMEDOUT';
    const network=timeout||error?.level==='client-socket'||['ECONNRESET','ECONNREFUSED','EHOSTUNREACH','ENETUNREACH','EPIPE'].includes(error?.code);
    // Retry only before authenticated readiness: no command or checkout payload was sent.
    if(!ready&&network&&attempt===1){client=undefined;connection.end();connect();return;}
    finish(new Error(ready?'BROKER_OUTCOME_UNKNOWN':timeout?'BROKER_CONNECT_TIMEOUT':'BROKER_CONNECT_UNAVAILABLE'));
   });
   connection.on('close',()=>{if(done||client!==connection||ready)return;if(attempt===1){client=undefined;connection.end();connect();return;}finish(new Error('BROKER_CONNECT_UNAVAILABLE'));});
   connection.on('ready',()=>{
    if(done||client!==connection)return;ready=true;
    connection.exec('checkout',(error,stream)=>{
     if(done)return;if(error){finish(new Error('BROKER_OUTCOME_UNKNOWN'));return;}
     let output='',size=0;
     stream.on('data',(chunk:Buffer)=>{size+=chunk.length;if(size>(request.action==='withdrawal'?32768:16384)){finish(new Error('BROKER_RESPONSE_INVALID'));return;}output+=chunk.toString();});
     stream.on('close',(code:number)=>{if(done)return;try{if(code!==0)throw new Error();finish(null,JSON.parse(output));}catch{finish(new Error('BROKER_RESPONSE_INVALID'));}});
     stream.end(JSON.stringify(request));
    });
   });
   try{connection.connect({host:'179.198.205.77',port:22,username:'root',privateKey:process.env.ARVOA_CHECKOUT_BROKER_KEY,readyTimeout:10000,hostVerifier:(key:Buffer)=>createHash('sha256').update(key).digest('hex')===process.env.ARVOA_CHECKOUT_BROKER_FINGERPRINT});}catch{finish(new Error('BROKER_CONNECT_UNAVAILABLE'));}
  }
  connect();
 });
}
const errors:Record<string,string>={CHECKOUT_ORIGIN_INVALID:'A fizetés erről a webcímről nem indítható.',CHECKOUT_ORIGIN_MISMATCH:'Ezt a fizetést másik webcímen kezdted meg. Folytasd az eredeti böngészőlapon; ne indíts új fizetést.',EMPTY_CART:'A kosarad üres vagy lejárt.',OUT_OF_STOCK:'Egy termékből nincs elegendő készlet. Ellenőrizd a kosarat.',INVALID_DETAILS:'Ellenőrizd a megadott adatokat.',DELIVERY_INVALID:'Válassz érvényes szállítási módot és átvételi helyet.',CHECKOUT_IN_PROGRESS:'Ehhez a kosárhoz már megkezdődött a fizetés. Folytasd a korábbi fizetést vagy várd meg annak lejáratát.',AMOUNT_CHANGED:'A kosár összege megváltozott. Ellenőrizd a kosarat.',PRIVATE_CUSTOMER_ONLY:'A bankkártyás fizetés jelenleg magánszemélyek részére érhető el.',PAYMENT_INVALID:'Válassz érvényes fizetési módot.',ALREADY_ORDERED:'Ezt a kosarat már megrendelted.',ALREADY_PAID:'Ezt a kosarat már kifizetted.',COD_LIMIT_EXCEEDED:'Utánvéttel legfeljebb 100 000 Ft végösszegű rendelés adható le. Válassz bankkártyás fizetést.'};
async function shopifyConsent(req:Request,text:string){
 const headers=new Headers({'Cache-Control':'private, no-store','Vary':'Cookie','X-Content-Type-Options':'nosniff'});
 try{
  const input=JSON.parse(text);if(typeof input.query!=='string'||input.query.length>6000)throw Error();
  const match=/visitorConsent:\s*\{([^{}]*)\}/.exec(input.query);if(!match)throw Error();
  const values:Record<string,boolean>={};for(const pair of (match[1].trim()?match[1].split(','):[])){const m=/^\s*(analytics|marketing|preferences|saleOfData):\s*(true|false)\s*$/.exec(pair);if(!m||m[1] in values)throw Error();values[m[1]]=m[2]==='true';}
  if((Object.keys(values).length!==0&&Object.keys(values).length!==4)||values.marketing||values.preferences||values.saleOfData)throw Error();
  const origin=new URL(req.url).origin;const cookie=(req.headers.get('cookie')??'').split(';').map(v=>v.trim()).filter(v=>/^_shopify_(essential|analytics)=/.test(v)&&v.length<8192).join('; ');
  const choices=Object.keys(values).length?'analytics:'+values.analytics+',marketing:false,preferences:false,saleOfData:false':'';
  const query='query { consentManagement { cookies(visitorConsent:{'+choices+'}) { trackingConsentCookie cookieDomain landingPageCookie origReferrerCookie shopifyUnique shopifyVisit } customerAccountUrl } }';
  const upstream=await fetch('https://arvoalux.myshopify.com/api/unstable/graphql.json',{method:'POST',headers:{'Content-Type':'application/json','Shopify-Storefront-Consent-Management':'1','Origin':origin,'Sec-Shopify-Storefront-Origin':origin,...(cookie?{Cookie:cookie}:{})},body:JSON.stringify({query}),cache:'no-store',redirect:'error',signal:AbortSignal.timeout(10000)});
  if(!upstream.ok)throw Error();const data=await upstream.json();if(data.errors?.length||!data.data?.consentManagement)throw Error();
  for(const raw of upstream.headers.getSetCookie()){if(!/^_shopify_(essential|analytics)=/.test(raw))continue;headers.append('Set-Cookie',raw.replace(/;\s*Domain=[^;]*/ig,'').replace(/;\s*SameSite=[^;]*/ig,'')+'; Secure; SameSite=Lax');}
  return Response.json(data,{headers});
 }catch{return Response.json({error:'Consent synchronization unavailable.'},{status:503,headers});}
}
export async function checkoutRoute(req:Request,action:'create'|'status'|'webhook'){
 const headers={'Cache-Control':'no-store, private','X-Content-Type-Options':'nosniff','Vary':'Cookie'};const reply=(j:unknown,status=200)=>Response.json(j,{status,headers});
 const brand=process.env.STOREFRONT_APP_BRAND;if(!brand||!domains[brand]||!process.env.ARVOA_CHECKOUT_BROKER_KEY)return reply({error:'A fizetés jelenleg nem elérhető.'},503);
 if(req.method!=='POST'||req.headers.has('next-action'))return reply({error:'Érvénytelen kérés.'},405);
 if(action!=='webhook'&&(req.headers.get('origin')!==new URL(req.url).origin||!req.headers.get('content-type')?.startsWith('application/json')))return reply({error:'Érvénytelen kérés.'},403);
 const text=await req.text();if(text.length>(action==='webhook'?131072:8192))return reply({error:'Érvénytelen kérés.'},413);
 if(brand==='arvoalux'&&action==='status'&&req.headers.get('Shopify-Storefront-Consent-Management')==='1')return shopifyConsent(req,text);
 try{
  if(action==='webhook'){const signature=req.headers.get('stripe-signature')||'';if(!signature)return reply({error:'Érvénytelen aláírás.'},400);const result=await broker({brand,action,body:{raw:text,signature}});return result.ok?reply({received:true}):reply({error:'A fizetés visszaigazolása nem sikerült.'},result.error==='SIGNATURE_INVALID'?400:503);}
  const jar=await cookies(),cartId=jar.get('__Host-arvoa-cart-'+brand)?.value;let body:any;try{body=JSON.parse(text);}catch{return reply({error:'Érvénytelen kérés.'},400);}
  if(action==='create'){
   if(body.termsAccepted!==true)return reply({error:'A rendeléshez fogadd el a szerződési feltételeket és az adatkezelési tájékoztatót.'},400);
   if(body.termsVersion!=='aszf-20261013-v1')return reply({error:'A szerződési feltételek frissültek. Frissítsd az oldalt, és ellenőrizd a rendelést.'},400);
   if(!cartId)return reply({error:errors.EMPTY_CART},400);
   let attributionBrowser=jar.get('__Host-arvoa-attribution-'+brand)?.value;
   if(brand==='arvoalux'&&body.attribution?.analytics===true&&!/^[a-f0-9]{64}$/.test(attributionBrowser??'')){attributionBrowser=randomBytes(32).toString('hex');jar.set('__Host-arvoa-attribution-'+brand,attributionBrowser,{secure:true,httpOnly:true,sameSite:'lax',path:'/',maxAge:90*86400});}
   const result=await broker({brand,action,body:{...(brand==='arvoalux'?{attribution:body.attribution,attributionBrowser}:{}),...(brand==='arvoalux'?{returnOrigin:new URL(req.url).origin}:{}),details:body.details,customerType:body.customerType,deliveryMethod:body.deliveryMethod,pickupPoint:body.pickupPoint,separateBilling:body.separateBilling,payment:body.payment,codVersion:'cod390-v1',summaryVersion:'review-v1',termsAccepted:true,termsVersion:body.termsVersion,reviewedSubtotal:body.reviewedSubtotal,cartId}});
   if(!result.ok)return reply({error:errors[result.error]||'A fizetés nem indult el. Próbáld újra később.'},400);
   if(result.state==='cod_placed'&&result.payment==='cod'&&body.payment==='cod'&&typeof result.orderNumber==='string'){
    jar.set('__Host-arvoa-payment-'+brand,result.ticket,{secure:true,httpOnly:true,sameSite:'lax',path:'/',maxAge:86400});
    if(result.clearCart)jar.set('__Host-arvoa-cart-'+brand,'',{secure:true,httpOnly:true,sameSite:'lax',path:'/',maxAge:0});
    return reply({state:'cod_placed',payment:'cod',orderNumber:result.orderNumber,amount:result.amount,analyticsPurchase:result.analyticsPurchase,analyticsProcessing:result.analyticsProcessing,measurementState:result.measurementState});
   }
   const url=new URL(result.url);if(url.protocol!=='https:'||url.hostname!=='checkout.stripe.com')return reply({error:'A fizetés nem elérhető.'},503);
   jar.set('__Host-arvoa-payment-'+brand,result.ticket,{secure:true,httpOnly:true,sameSite:'lax',path:'/',maxAge:86400});return reply({url:url.toString()});
  }
  const ticket=jar.get('__Host-arvoa-payment-'+brand)?.value;
  if(brand==='arvoalux'&&body.consentRevoked===true){const controlled=await broker({brand,action:'analytics_control',body:{ticket,consentRevoked:true,attributionBrowser:jar.get('__Host-arvoa-attribution-'+brand)?.value}});if(controlled.ok)jar.set('__Host-arvoa-attribution-'+brand,'',{secure:true,httpOnly:true,sameSite:'lax',path:'/',maxAge:0});return reply(controlled,controlled.ok?200:503);}
  if(!ticket)return reply({state:'missing'});
  if(brand==='arvoalux'&&(body.consentRevoked===true||['purchase','order_processing'].includes(body.analyticsClaim))){const controlled=await broker({brand,action:'analytics_control',body:{ticket,consentRevoked:body.consentRevoked===true,analyticsClaim:body.analyticsClaim}});return reply(controlled,controlled.ok?200:400);}
  const result=await broker({brand,action,body:{ticket,cartId}});if(result.ok===false)return reply({state:'processing',error:'A fizetés állapotát még ellenőrizzük. Próbáld újra később.'},503);
  if(result.clearCart)jar.set('__Host-arvoa-cart-'+brand,'',{secure:true,httpOnly:true,sameSite:'lax',path:'/',maxAge:0});return reply({state:result.state,orderNumber:result.orderNumber,amount:result.amount,analyticsPurchase:result.analyticsPurchase,analyticsProcessing:result.analyticsProcessing,measurementState:result.measurementState});
 }catch(error){const code=error instanceof Error&&['BROKER_CONNECT_TIMEOUT','BROKER_CONNECT_UNAVAILABLE','BROKER_OUTCOME_UNKNOWN','BROKER_RESPONSE_INVALID'].includes(error.message)?error.message:'CHECKOUT_UNAVAILABLE';return reply({error:['BROKER_OUTCOME_UNKNOWN','BROKER_RESPONSE_INVALID'].includes(code)?'A rendelés állapotát még ellenőrizzük. Ne add le újra a rendelést.':'A fizetés jelenleg nem elérhető. Próbáld újra később.',code},503);}
}
