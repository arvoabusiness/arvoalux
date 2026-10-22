import WithdrawalForm from './WithdrawalForm';
import LegalNavigation from '../_components/LegalNavigation';
export const metadata={title:'Elállás a szerződéstől'};
export default function WithdrawalPage(){return <article className="max-w-4xl mx-auto px-4 py-10 pb-28"><WithdrawalForm/><p>Az elállási jog részletes feltételei és nyilatkozatmintája az <a className="underline" href="/aszf#elallas-nyilatkozat">ÁSZF második mellékletében</a> olvashatók.</p><LegalNavigation/></article>;}
