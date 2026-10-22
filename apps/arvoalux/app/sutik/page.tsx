import type {Metadata} from 'next';
import {brand} from '@/brand.config';
import document from './documents.json';
import LegalNavigation from '../_components/LegalNavigation';
export const metadata:Metadata={title:document.title};
export default function LegalNotice(){return <article className="max-w-4xl mx-auto px-4 py-10 pb-28" data-testid="legal-notice-final"><h1 className="text-3xl font-bold mb-6">{brand.name} – {document.title}</h1><p className="mb-6">Frissítve: 2026. október 20.</p>{document.blocks.map(b=><div key={b.id} className="mb-4">{b.kind==='heading'?<h2 className="text-xl font-semibold mt-6">{b.text}</h2>:<p className="whitespace-pre-line break-words">{b.text}</p>}</div>)}<LegalNavigation/></article>;}
