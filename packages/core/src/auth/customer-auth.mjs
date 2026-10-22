import { createHmac, randomUUID } from 'node:crypto';
import { betterAuth } from 'better-auth';
import { mongodbAdapter } from 'better-auth/adapters/mongodb';
import { MongoClient } from 'mongodb';
import nodemailer from 'nodemailer';

export const brandDomains = Object.freeze({arvoalux:'arvoalux.hu',biobarat:'biobarat.eu',boltbio:'boltbio.hu',nagykervitamin:'nagykervitamin.hu',napivitamin:'napivitamin.eu',nutrimarket:'nutrimarket.hu',prevenciobolt:'prevenciobolt.hu',provitaminok:'provitaminok.hu',unipatikatt:'unipatikatt.hu'});
export function configuration(brand, env=process.env) {
 const domain=brandDomains[brand];
 if(!domain) throw new Error('Unknown customer brand');
 const prefix=brand.toUpperCase()+'_';
 const value=key=>env[prefix+key]??env[key];
 const uri=value('CUSTOMER_AUTH_MONGODB_URI');
 const secret=value('CUSTOMER_AUTH_SECRET');
 const smtpHost=value('CUSTOMER_AUTH_SMTP_HOST');
 const smtpPort=Number(value('CUSTOMER_AUTH_SMTP_PORT'));
 const smtpUser=value('CUSTOMER_AUTH_SMTP_USER');
 const smtpPassword=value('CUSTOMER_AUTH_SMTP_PASSWORD');
 const sender=value('CUSTOMER_AUTH_FROM');
 const enabled=value('CUSTOMER_AUTH_ENABLED')==='true';
 const gatewayURL=value('CUSTOMER_AUTH_GATEWAY_URL');
 const gatewaySecret=value('CUSTOMER_AUTH_GATEWAY_SECRET');
 const gatewayReady=!!(gatewayURL&&/^https:\/\/[^\s]+$/.test(gatewayURL)&&gatewaySecret&&gatewaySecret.length>=32);
 const valid=!!(uri&&/^mongodb(?:\+srv)?:\/\//.test(uri)&&secret&&secret.length>=32&&smtpHost&&[465,587].includes(smtpPort)&&smtpUser&&smtpPassword&&sender&&/^[^\s<>@]+@[^\s<>@]+$/.test(sender));
 return {brand,domain,uri,secret,smtpHost,smtpPort,smtpUser,smtpPassword,sender,gatewayURL,gatewaySecret,ready:enabled&&(valid||gatewayReady)};
}
export function authOptions({brand,secret,database,sendEmail}) {
 const domain=brandDomains[brand];if(!domain)throw new Error('Unknown customer brand');
 return {
  appName:brand,baseURL:'https://'+domain,basePath:'/api/auth',secret,database,
  trustedOrigins:['https://'+domain,'https://www.'+domain],
  logger:{disabled:true},
  emailAndPassword:{enabled:true,requireEmailVerification:true,minPasswordLength:12,maxPasswordLength:128,autoSignIn:false,revokeSessionsOnPasswordReset:true,
   sendResetPassword:async({user,url})=>{await sendEmail({to:user.email,subject:'Jelszó visszaállítása',text:'A jelszó visszaállításához nyisd meg ezt a hivatkozást:\n'+url+'\nHa nem te kérted, hagyd figyelmen kívül ezt az üzenetet.'});}},
  emailVerification:{sendOnSignUp:true,autoSignInAfterVerification:false,expiresIn:3600,
   sendVerificationEmail:async({user,url})=>{await sendEmail({to:user.email,subject:'E-mail-cím megerősítése',text:'Az e-mail-címed megerősítéséhez nyisd meg ezt a hivatkozást:\n'+url});}},
  session:{expiresIn:60*60*24*7,updateAge:60*60*24,cookieCache:{enabled:false}},
  rateLimit:{enabled:true,storage:'database',window:60,max:30,customRules:{'/sign-in/email':{window:60,max:5},'/sign-up/email':{window:60,max:3},'/request-password-reset':{window:60,max:3}}},
  advanced:{cookiePrefix:'arvoa_'+brand,useSecureCookies:true,crossSubDomainCookies:{enabled:false},defaultCookieAttributes:{httpOnly:true,secure:true,sameSite:'lax',path:'/'},ipAddress:{ipAddressHeaders:['x-vercel-forwarded-for']}},
 };
}
const instances=new Map();
export function customerAuth(brand) {
 const c=configuration(brand);if(!c.ready)return null;
 if(instances.has(brand))return instances.get(brand);
 const client=new MongoClient(c.uri,{serverSelectionTimeoutMS:5000,maxPoolSize:5,tls:true});
 const transporter=nodemailer.createTransport({host:c.smtpHost,port:c.smtpPort,secure:c.smtpPort===465,requireTLS:true,auth:{user:c.smtpUser,pass:c.smtpPassword},connectionTimeout:5000,socketTimeout:10000,logger:false,debug:false});
 const sendEmail=async message=>{try{await transporter.sendMail({...message,from:c.sender});}catch{throw new Error('Customer email delivery failed');}};
 const auth=betterAuth(authOptions({brand,secret:c.secret,database:mongodbAdapter(client.db('arvoa_customer_auth_'+brand),{client}),sendEmail}));
 instances.set(brand,auth);return auth;
}
const allowedGet=new Set(['get-session','verify-email','account']);
export function allowedAuthPath(method,path){return method==='GET'?(allowedGet.has(path)||/^reset-password\/[A-Za-z0-9_-]{1,512}$/.test(path)):method==='POST'&&(allowedPost.has(path)||['newsletter/request','newsletter/confirm'].includes(path));}
const allowedPost=new Set(['account','sign-in/email','sign-up/email','sign-out','request-password-reset','reset-password','send-verification-email']);
export async function handleCustomerAuth(request,brand,providedAuth) {
 const domain=brandDomains[brand];
 const respond=(value,status=200)=>Response.json(value,{status,headers:{'Cache-Control':'no-store','Referrer-Policy':'no-referrer'}});
 if(!domain)return respond({error:'UNAVAILABLE'},503);
 const url=new URL(request.url);const path=url.pathname.replace(/^\/api\/auth\//,'');
 if(!(['GET','POST'].includes(request.method)))return respond({error:'METHOD_NOT_ALLOWED'},405);
 if(!allowedAuthPath(request.method,path))return respond({error:'NOT_FOUND'},404);
 if(request.method==='POST'){
  if(!['https://'+domain,'https://www.'+domain].includes(request.headers.get('origin')))return respond({error:'INVALID_ORIGIN'},403);
  if(!request.headers.get('content-type')?.startsWith('application/json'))return respond({error:'INVALID_BODY'},415);
  const body=request.body;if(body){const reader=body.getReader();const chunks=[];let size=0;for(;;){const chunk=await reader.read();if(chunk.done)break;size+=chunk.value.length;if(size>8192){await reader.cancel();return respond({error:'BODY_TOO_LARGE'},413);}chunks.push(chunk.value);}const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length;}request=new Request(request.url,{method:request.method,headers:request.headers,body:bytes});}
 }
 const c=configuration(brand);
 if(!providedAuth&&c.ready&&c.gatewayURL)return proxyCustomerAuth(request,brand,c);
 const auth=providedAuth??customerAuth(brand);if(!auth)return respond({error:'AUTH_NOT_CONFIGURED'},503);
 try{
  const result=await auth.handler(request);
  result.headers.set('Cache-Control','no-store');result.headers.set('Referrer-Policy','no-referrer');
  if(result.headers.get('location'))return result;
  if(!result.ok)return respond({error:result.status===429?'RATE_LIMITED':'AUTH_FAILED'},result.status);
  const data=await result.json().catch(()=>null);
  const sanitized=path==='get-session'?{user:data?.user?{name:data.user.name,email:data.user.email}:null}:{ok:true};
  const response=respond(sanitized,result.status);for(const cookie of result.headers.getSetCookie())response.headers.append('set-cookie',cookie);return response;
 }catch{return respond({error:'AUTH_UNAVAILABLE'},503);}
}

export function gatewaySignature(secret,{brand,method,path,timestamp,nonce,body}){
 return createHmac('sha256',secret).update([brand,method,path,timestamp,nonce,body].join('\n')).digest('hex');
}
async function proxyCustomerAuth(request,brand,c){
 const respond=(error,status)=>Response.json({error},{status,headers:{'Cache-Control':'no-store','Referrer-Policy':'no-referrer'}});
 try{
  const url=new URL(request.url);const path=url.pathname+url.search;const body=request.method==='POST'?await request.text():'';
  const timestamp=String(Date.now()),nonce=randomUUID();
  const headers={'x-arvoa-brand':brand,'x-arvoa-timestamp':timestamp,'x-arvoa-nonce':nonce,'x-arvoa-signature':gatewaySignature(c.gatewaySecret,{brand,method:request.method,path,timestamp,nonce,body})};
  for(const key of ['origin','cookie','content-type','x-vercel-forwarded-for']){const value=request.headers.get(key);if(value)headers[key]=value;}
  const result=await fetch(new URL(path,c.gatewayURL),{method:request.method,headers,body:body||undefined,redirect:'manual',signal:AbortSignal.timeout(25000),cache:'no-store'});
  const output=new Headers({'Cache-Control':'no-store','Referrer-Policy':'no-referrer','Content-Type':'application/json'});
  for(const cookie of result.headers.getSetCookie())output.append('set-cookie',cookie);
  const location=result.headers.get('location');
  if(location){const destination=new URL(location,'https://'+c.domain);if(!['https://'+c.domain,'https://www.'+c.domain].includes(destination.origin))return respond('INVALID_REDIRECT',502);output.set('location',destination.href);}
  return new Response(await result.arrayBuffer(),{status:result.status,headers:output});
 }catch{return respond('AUTH_UNAVAILABLE',503);}
}
