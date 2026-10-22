import LegalNavigation from "../../_components/LegalNavigation";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

const INFO_PAGES = {
  "company": {
    title: "Vállalati adatok",
    paragraphs: [
      "Az Arvoa Lux webáruház eladója és üzemeltetője: Supreme Pharmatech Europe s.r.o.",
      "Székhely: Senný trh 3116/7, 945 01 Komárno, Szlovákia.",
      "IČO (szlovák szervezetazonosító, nem magyar adószám): 56139471. Nyilvántartás: Obchodný register Okresného súdu Nitra, Sro részleg, 62901/N betétszám. Bejegyzés: 2024. március 15.",
      "Ügyfélszolgálati kapcsolattartó: ARVOALUX.HU. Visszaküldés, írásbeli panasz és elállási nyilatkozat postai címzettje: Sebők Tamás, ARVOALUX.HU, 1117 Budapest, Budafoki út 111., Magyarország.",
    ],
  },
  "order-process": {
    title: "Rendelés menete",
    paragraphs: [
      "Rendelés egyszerűen, online.",
      "Válassza ki a terméket, majd tegye a kosárba. A kosárban módosíthatja a mennyiséget vagy eltávolíthatja a terméket. A pénztárban adja meg a szükséges adatokat, válasszon szállítási és fizetési módot, majd ellenőrizze a rendelés végösszegét.",
    ],
  },
  "returns": {
    title: "Panaszok és áruvisszaküldések",
    paragraphs: [
      "Panaszodat az info@arvoalux.hu e-mail-címre vagy postán küldheted el. Az ügyintéző: Sebők Tamás. Telefonon is kereshetsz minket az alább megadott elérhetőségen.",
      "Visszaküldés, írásbeli panasz és elállási nyilatkozat postai címzettje: Sebők Tamás, ARVOALUX.HU, 1117 Budapest, Budafoki út 111., Magyarország.",
      "Indokolás nélküli elállás esetén a visszaküldés közvetlen költségét a vásárló viseli, amennyiben erről a szerződéskötés előtt megfelelő tájékoztatást kapott, és a jogszabály ezt lehetővé teszi. Ha ez a tájékoztatás elmaradt, a költség nem terhelhető a vásárlóra.",
      "Személyes visszáru-leadás nincs; az árut postával vagy futárral lehet visszajuttatni. Ez a fizikai visszaküldés rendje, az elállási nyilatkozat közlésének jogszerű módjait nem korlátozza.",
      "Ez a költségviselési szabály nem vonatkozik a hibás teljesítés miatt az eladót terhelő költségekre. Nem számítunk fel kezelési vagy újraktározási díjat.",
      "A visszaküldés költségviselése nem érinti a jogszabály szerint visszajáró eredeti, szokásos kiszállítás költségének megtérítését. A szokásos postai úton nem visszaküldhető árunál a várható visszaküldési költségről a vásárlás előtt külön tájékoztatás szükséges.",
    ],
    officialHref: "/elallas",
    officialLabel: "Elállási nyilatkozat küldése – elérhetőségek",
  },
  "contact": {
    title: "Kapcsolat és elérhetőség",
    paragraphs: [
      "Az Arvoa Lux webáruház eladója: Supreme Pharmatech Europe s.r.o.",
      "Ügyfélszolgálati kapcsolattartó, valamint a panaszok, elállások és adatvédelmi kérelmek ügyintézője: Sebők Tamás.",
      "Visszaküldés, írásbeli panasz és elállási nyilatkozat postai címzettje: Sebők Tamás, ARVOALUX.HU, 1117 Budapest, Budafoki út 111., Magyarország. Ez a cím nem a társaság székhelye.",
    ],
  },
  "gift-cards": {
    title: "Ajándékutalványok",
    paragraphs: [
      "Ajándékutalvány jelenleg nem vásárolható és nem váltható be.",
    ],
  },
  "promotions": {
    title: "Kuponkódok és promóciók",
    paragraphs: [
      "Az aktív kedvezményeket és azok feltételeit mindig az oldalon, a kosárban vagy a pénztárban tüntetjük fel.",
    ],
  },
  "about": {
    title: "Az Arvoa Lux",
    paragraphs: [
      "Az Arvoa Lux egészségmegőrzéshez, mindennapi jólléthez és szépségápoláshoz kapcsolódó termékeket kínáló online áruház.",
      "A termékoldalakon megtalálja a részletes leírásokat, az aktuális árakat és az elérhetőséget.",
    ],
  },
  "reviews": {
    title: "Vásárlói élmények",
    paragraphs: [
      "Termékkel vagy vásárlással kapcsolatos kérdésben ügyfélszolgálatunk szívesen segít.",
    ],
  },
  "news": {
    title: "Hírszerkesztőség",
    paragraphs: [
      "Újdonságainkat az ArvoaLux Magazinban és az aktuális ajánlatok között találja.",
    ],
  },
} as const;

type InfoSlug = keyof typeof INFO_PAGES;

export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(INFO_PAGES).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const page = INFO_PAGES[slug as InfoSlug];
  return page ? { title: `${page.title} | Arvoa Lux` } : {};
}

export default async function InfoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = INFO_PAGES[slug as InfoSlug];
  if (!page) notFound();

  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-12 lg:px-8 lg:py-16">
      <h1 className="text-3xl font-bold text-gray-900 lg:text-4xl">{page.title}</h1>
      <div className="mt-8 space-y-5 text-base leading-7 text-gray-700">
        {page.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
        {"officialHref" in page && (
          <p>
            <a className="font-semibold text-brand hover:underline" href={page.officialHref} target="_blank" rel="noopener noreferrer">
              {page.officialLabel}
            </a>
          </p>
        )}
        <section className="mt-8 rounded-xl border border-gray-200 bg-gray-50 p-6">
          <h2 className="text-xl font-semibold text-gray-900">Ügyfélszolgálat</h2>
          <p className="mt-3">
            Telefon: <a className="font-semibold text-brand hover:underline" href="tel:+36209319009">+36-20/931-9009</a>
          </p>
          <p className="mt-3">E-mail: <a className="font-semibold text-brand hover:underline" href="mailto:info@arvoalux.hu">info@arvoalux.hu</a></p>
          <p className="mt-3">Telefonos ügyfélszolgálat: hétfőtől péntekig 09:30–16:30.</p>
        </section>
        {["company", "returns", "contact", "order-process"].includes(slug) && <LegalNavigation />}
        <p className="pt-3"><Link className="font-semibold text-brand hover:underline" href="/">Vissza a főoldalra</Link></p>
      </div>
    </main>
  );
}
