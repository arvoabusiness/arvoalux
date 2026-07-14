import { HealthGoalPage } from "@arvoalux/core";
import { brand } from "@/brand.config";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <HealthGoalPage
      brand={brand}
      title="Immunerősítés"
      intro="Támogasd immunrendszered természetes módon, kiváló minőségű vitaminokkal és ásványi anyagokkal."
      benefits={[
        "C-vitamin és cink támogatás",
        "D3-vitamin az egészséges immunrendszerért",
        "Természetes összetevők",
        "Bevizsgált, EU-s minőség",
      ]}
      collectionHandle="immunerositesi"
    />
  );
}
