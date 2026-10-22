import Link from "next/link";

const tiles = [
  {
    "id": "immune",
    "label": "ŐSZI VÁLOGATÁS",
    "title": "Őszi immunerősítés",
    "description": "Vitaminok és ásványi anyagok az őszi mindennapokra.",
    "href": "/collections/immunerositok?selection=autumn-immune",
    "cta": "Felfedezem",
    "image": "vitamins"
  },
  {
    "id": "sale",
    "label": "AKCIÓS TERMÉKEK",
    "title": "Jó választás. Kedvező áron.",
    "description": "JutaVit, Goodwill, Gallmet és Kelo-cote ajánlatok egy helyen.",
    "href": "/akciok",
    "cta": "Megnézem az akciókat"
  },
  {
    "id": "move",
    "label": "MOZGÁS ÉS ÍZÜLETEK",
    "title": "Maradj lendületben ősszel is.",
    "description": "Válogass az ízület- és porckategória kínálatából.",
    "href": "/collections/izulet-porc?selection=autumn-joints",
    "cta": "Megnézem a kínálatot"
  },
  {
    "id": "energy",
    "label": "MINDENNAPI RUTIN",
    "title": "Energia a hétköznapokra",
    "description": "Tudatos választások a sűrűbb őszi napokra.",
    "href": "/collections/energia-koncentracio?selection=autumn-energy",
    "cta": "Felfedezem",
    "image": "routine"
  },
  {
    "id": "skin",
    "label": "CÉLZOTT BŐRÁPOLÁS",
    "title": "Ekcémára hajlamos bőr ápolása",
    "description": "Ismerd meg a JutaVit Dermexema krémet.",
    "href": "/collections/kez-es-borapolas",
    "cta": "Felfedezem",
    "image": "skincare"
  }
];

export function OwnerHero() {
  return <section className="owner-hero hero-section" data-testid="hero-banner" data-owner-phase="autumn-20261021" aria-label="ArvoaLux őszi ajánlatok">
    <div className="promo-season">ARVOALUX · ŐSZI MINDENNAPOK</div>
    <div className="promo-mosaic">{tiles.map((tile, index) => <Link prefetch={false} href={tile.href} key={tile.id} className={`promo-tile promo-${tile.id}`} data-owner-tile={tile.id} data-testid={`banner-${index + 1}`}>
      {tile.image && <img src={`/owner-hero/${tile.image}.jpg`} alt="" className="promo-photo" loading={index === 0 ? "eager" : "lazy"} />}
      <div className="promo-content">
        <span className="promo-label">{tile.label}</span>
        {index === 0 ? <h1>{tile.title}</h1> : <h2>{tile.title}</h2>}
        <p>{tile.description}</p>
        <span className="promo-link">{tile.cta}<span aria-hidden="true">↗</span></span>
      </div>
    </Link>)}</div>
  </section>;
}
