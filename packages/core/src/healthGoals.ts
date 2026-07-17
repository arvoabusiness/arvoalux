// Health-goal collections — content from the client spec
// (arvoalux shopify categories healthgoals.xlsx, Sheet 1). Prop-driven so
// the HealthGoalPage template renders one page per goal.

export type HealthGoal = {
  slug: string; // route segment + Shopify collection handle
  title: string;
  intro: string;
  benefits: string[];
  collectionHandle: string;
};

export const healthGoals: HealthGoal[] = [
  {
    slug: "immunerositok",
    title: "Immunrendszer erősítése",
    intro: "Erősítse meg szervezete védekezőképességét! C-vitamin, D-vitamin, cink, béta-glükán és adaptogén gyógynövények az immunrendszer természetes támogatásához — különösen fontos az átmeneti évszakokban.",
    benefits: ["C-vitamin", "D-vitamin", "Cink", "Echinacea", "Béta-glükán"],
    collectionHandle: "immunerositok",
  },
  {
    slug: "izulet-porc",
    title: "Ízület & csontozat",
    intro: "Természetes megoldások ízületi kényelmetlenség esetén. Kollagén, glükozamin, kondroitin és D-vitamin kombinációja a mozgékonyság megőrzéséhez és az ízületek hosszú távú védelméhez.",
    benefits: ["Kollagén", "Glükozamin", "Kondroitin", "Cartinorm", "Collamouv"],
    collectionHandle: "izulet-porc",
  },
  {
    slug: "sziv-keringes",
    title: "Szív & keringés",
    intro: "Szíve egészségéért tegyen a legjobbat! Omega-3, Koenzim Q10, magnézium és növényi kivonatok az egészséges vérnyomás, koleszterinszint és érrendszeri keringés támogatásához.",
    benefits: ["Omega-3", "Q10", "Magnézium", "Gallmet", "Rheotin"],
    collectionHandle: "sziv-keringes",
  },
  {
    slug: "emesztes-belrendszer",
    title: "Emésztés & bélrendszer",
    intro: "Az egészséges bélflóra az általános jóllét alapja. Probiotikumok, prebiotikumok, enzimek és gyógynövényes készítmények a kényelmes emésztéshez és a bélrendszer egyensúlyának megőrzéséhez.",
    benefits: ["Florabalance", "Bonolact", "Alflorex", "Tasectan", "Máriatövis"],
    collectionHandle: "emesztes-belrendszer",
  },
  {
    slug: "alvas-stressz",
    title: "Alvás & stressz",
    intro: "Pihenjen jobban, érezze jobban magát! Magnézium, valeriana és adaptogén növények a minőségi alvás és a stresszkezelés természetes támogatásához — altatók és mellékhatások nélkül.",
    benefits: ["Magnézium-biszglicinát", "Valeriana", "Herba Relax", "GAL Glicin", "Nervaron"],
    collectionHandle: "alvas-stressz",
  },
  {
    slug: "energia-koncentracio",
    title: "Energia & koncentráció",
    intro: "Természetes energiaforrás a mindennapokhoz. B-vitaminok, magnézium, koenzim Q10 és adaptogének az életerő, mentális frissesség és koncentrációképesség fenntartásához — koffein nélkül.",
    benefits: ["B-komplex", "Magnézium", "Q10", "Ginkgo biloba", "INTELUX"],
    collectionHandle: "energia-koncentracio",
  },
  {
    slug: "bor-haj-korom",
    title: "Bőr, haj & köröm",
    intro: "A szépség belülről fakad. Kollagén, hialuronsav, biotin és antioxidáns vitaminok a sugárzó bőrért, erős körmökért és egészséges, telt hajért.",
    benefits: ["Kollagén", "Hialuronsav", "Hairmina", "Dermawill", "Biotin"],
    collectionHandle: "bor-haj-korom",
  },
  {
    slug: "maj-meregtelenitetes",
    title: "Máj & méregtelenítés",
    intro: "Támogassa mája természetes méregtelenítő funkcióját! Máriatövis, articsóka, kurkuma és epesav-szabályozó készítmények az egészséges májfunkció és az emésztési egyensúly megőrzéséhez.",
    benefits: ["Máriatövis", "Gallmet", "Sectacol", "Ibedekron", "Kurkuma"],
    collectionHandle: "maj-meregtelenitetes",
  },
  {
    slug: "nok-egeszsege",
    title: "Nők egészsége",
    intro: "Átfogó támogatás nőknek az élet minden szakaszában — terhesvitaminoktól a változókor tünetein át a hormonális egyensúlyig. Természetes, tudományosan megalapozott megoldások.",
    benefits: ["Trimeszter", "Japonica Femina", "Mensesnorm", "Profertil Female", "Barátcserje"],
    collectionHandle: "nok-egeszsege",
  },
  {
    slug: "ferfi-egeszseg",
    title: "Férfi egészség",
    intro: "Célzott támogatás férfiak számára — reproduktív egészségtől a prosztata-védelemig és a fizikai teljesítmény fenntartásáig. Természetes hatóanyagok a férfias vitalitás megőrzéséhez.",
    benefits: ["Profertil", "Pote-Mix", "Prostalong", "Tökmagolaj", "Trimeszter Men"],
    collectionHandle: "ferfi-egeszseg",
  },
  {
    slug: "gyerekeknek",
    title: "Gyermekek egészsége",
    intro: "Gyermeke fejlődéséhez a legjobban bevehető, ízletes vitaminok és étrend-kiegészítők. D-vitamin, multivitamin, probiotikum és immunerősítők gyerekbarát formában.",
    benefits: ["JutaVit Solar Kids", "Bonolact Pro+Kids", "D3 Kid", "Fortacell Junior", "Florabalance Junior"],
    collectionHandle: "gyerekeknek",
  },
  {
    slug: "szem-egeszseg",
    title: "Látás & szemegészség",
    intro: "Védje szemét a digitális kor kihívásaitól! Lutein, zeaxantin, szemcsepp és AREDS2 formula készítmények a makula egészségéért, a szem nedvességéért és az éles látásért.",
    benefits: ["Eyejuice", "Makula komplex", "Inzadin", "Eyejuice Allergy", "Jamieson Bilberry"],
    collectionHandle: "szem-egeszseg",
  },
  {
    slug: "vercukorszint",
    title: "Vércukorszint & anyagcsere",
    intro: "Természetes támogatás a vércukorszint és az anyagcsere egyensúlyához. Króm, fahéj, berberin és speciális formula étrend-kiegészítők az egészséges inzulinérzékenységért.",
    benefits: ["Curalin", "Zekron", "Zealoxan", "Diab Protect", "Fahéj"],
    collectionHandle: "vercukorszint",
  },
  {
    slug: "errendszer-visszer",
    title: "Visszér & lábak",
    intro: "Könnyű, pihent lábakért! Diozmint, heszperidint és gyógynövényes vénaterősítő készítmények az egészséges érfali tónus, a nehéz lábérzet csökkentése és a keringés javítása érdekében.",
    benefits: ["Vendobrexon", "Loxacon", "Loxacon Active krém", "Diozmin"],
    collectionHandle: "errendszer-visszer",
  },
];

export const healthGoalBySlug = (slug: string): HealthGoal | undefined =>
  healthGoals.find((g) => g.slug === slug);
