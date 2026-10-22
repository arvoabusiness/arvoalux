import {broker} from '@arvoalux/core/checkout';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export const maxDuration=60;
// Same-origin bounded withdrawal intake using the existing authenticated broker.
const domains:Record<string,string>={arvoalux:'arvoalux.hu',biobarat:'biobarat.eu',boltbio:'boltbio.hu',nagykervitamin:'nagykervitamin.hu',napivitamin:'napivitamin.eu',nutrimarket:'nutrimarket.hu',prevenciobolt:'prevenciobolt.hu',provitaminok:'provitaminok.hu',unipatikatt:'unipatikatt.hu'};
function withdrawalHandler(brand:string,broker:(request:Record<string,unknown>)=>Promise<any>){
 return async function POST(request:Request){
  const reply=(body:unknown,status=200)=>Response.json(body,{status,headers:{'Cache-Control':'no-store'}});
  if(!domains[brand])return reply({ok:false,error:'INVALID_BRAND'},400);
  if(request.headers.get('origin')!==new URL(request.url).origin)return reply({ok:false,error:'INVALID_ORIGIN'},403);
  if(!request.headers.get('content-type')?.toLowerCase().startsWith('application/json'))return reply({ok:false,error:'INVALID_CONTENT_TYPE'},415);
  const declared=Number(request.headers.get('content-length')||0);
  if(!Number.isFinite(declared)||declared<0||declared>8192)return reply({ok:false,error:'REQUEST_TOO_LARGE'},413);
  const reader=request.body?.getReader();if(!reader)return reply({ok:false,error:'INVALID_REQUEST'},400);
  const chunks:Uint8Array[]=[];let size=0;
  try{
   while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>8192){await reader.cancel();return reply({ok:false,error:'REQUEST_TOO_LARGE'},413);}chunks.push(value);}
   const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.byteLength;}
   const body=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(bytes));
   if(!body||typeof body!=='object'||Array.isArray(body))return reply({ok:false,error:'INVALID_REQUEST'},400);
   const result=await broker({brand,action:'withdrawal',body:{name:body.name,contractId:body.contractId,email:body.email,decision:body.decision,confirmed:body.confirmed,requestId:body.requestId}});
   return reply(result,result.ok?200:result.error==='RATE_LIMIT'?429:400);
  }catch{return reply({ok:false,error:'WITHDRAWAL_OUTCOME_UNKNOWN'},503);}
 };
}

export async function POST(req:Request){const brand=process.env.STOREFRONT_APP_BRAND;if(!brand||!domains[brand]||!process.env.ARVOA_CHECKOUT_BROKER_KEY)return Response.json({ok:false,error:'UNAVAILABLE'},{status:503});return withdrawalHandler(brand,broker)(req);}
