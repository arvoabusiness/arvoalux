import documents from '../aszf/documents.json';
import LegalNavigation from '../_components/LegalNavigation';
export const metadata={title:"Szállítás és fizetés"};
export default function LegalPage(){return <article className="max-w-4xl mx-auto px-4 py-10 pb-28"><h1 className="text-3xl font-bold mb-6">Szállítás és fizetés</h1>{documents.filter(d=>["szallitas-fizetes"].includes(d.slug)).map(d=><section key={d.slug}><h2 className="text-2xl font-semibold my-6">{d.title}</h2>{d.blocks.map(b=>b.kind==='heading'?<h3 className="text-xl font-semibold my-4" key={b.id}>{b.text}</h3>:<p className="whitespace-pre-line my-4" key={b.id}>{b.text}</p>)}</section>)}<LegalNavigation/></article>;}
