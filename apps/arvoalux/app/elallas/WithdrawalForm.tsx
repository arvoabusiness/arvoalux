'use client';
import {useState, useRef} from 'react';

export default function WithdrawalForm(){
 const [review,setReview]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState(''),[receipt,setReceipt]=useState<any>(null);
 const [data,setData]=useState({name:'',contractId:'',email:'',decision:false});
 const requestId=useRef<string>('');
 const locked=useRef(false);
 async function submit(){
  if(locked.current)return;locked.current=true;setBusy(true);setError('');
  if(!requestId.current)requestId.current=crypto.randomUUID();
  try{
   const r=await fetch('/api/withdrawal',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...data,confirmed:true,requestId:requestId.current})});
   const result=await r.json();if(!r.ok||!result.ok)throw new Error();setReceipt(result);
  }catch{setError('A visszaigazolás még nem érkezett meg. Azonos adatokkal újra ellenőrizheted a beküldést. A nyilatkozatot e-mailben is elküldheted az ÁSZF-ben megadott elérhetőségre.');}
  finally{locked.current=false;setBusy(false);}
 }
 if(receipt)return <section><h1>Elállási nyilatkozat beérkezett</h1><p>A nyilatkozat tartalmát és beérkezési idejét rögzítettük. Őrizd meg a visszaigazolást.</p><a download={receipt.receiptFilename} href={'data:text/plain;charset=utf-8;base64,'+receipt.receiptBase64}>Visszaigazolás letöltése</a><p>{receipt.emailStatus==='accepted'?'A visszaigazoló e-mailt a levelezőszolgáltató fogadta.':'Az e-mail kézbesítése még nem igazolt; töltsd le a visszaigazolást.'}</p><pre style={{whiteSpace:'pre-wrap'}}>{receipt.receiptText}</pre></section>;
 return <section style={{maxWidth:640,margin:'2rem auto',padding:'1rem'}}><h1>elállás a szerződéstől</h1><p>Bejelentkezés nélkül is beküldheted a nyilatkozatot. Ha nem ismered a rendelési számot, más, a szerződés azonosítására alkalmas adatot adj meg. Az elállás e-mailben is bejelenthető az ÁSZF-ben szereplő elérhetőségen.</p>
 {!review?<form onSubmit={e=>{e.preventDefault();setReview(true);}}>
 {(['name','contractId','email'] as const).map(k=><label key={k} style={{display:'block',margin:'1rem 0'}}>{({name:'Teljes név',contractId:'Szerződés / rendelés azonosítója',email:'E-mail a visszaigazoláshoz'})[k]}<input required type={k==='email'?'email':'text'} maxLength={k==='email'?254:200} value={data[k]} onChange={e=>setData({...data,[k]:e.target.value})} style={{display:'block',width:'100%'}}/></label>)}
 <label><input required type="checkbox" checked={data.decision} onChange={e=>setData({...data,decision:e.target.checked})}/> Elállok a fent azonosított szerződéstől.</label><p><button type="submit">elállás a szerződéstől</button></p></form>:
 <div><h2>Ellenőrizd a nyilatkozatot</h2><p>{data.name}<br/>{data.contractId}<br/>{data.email}</p><p>Elállok a fent azonosított szerződéstől.</p><button disabled={busy} onClick={submit}>elállás megerősítése</button> <button disabled={busy||!!requestId.current} onClick={()=>setReview(false)}>Adatok javítása</button><p role="status">{busy?'Beküldés folyamatban…':error}</p></div>}
 </section>;
}
