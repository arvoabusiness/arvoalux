import { Truck, Gift, Shield } from "lucide-react";

const items = [
  { icon: Truck, title: "Ingyenes szállítás", sub: "14 000 Ft felett", justify: "md:justify-start" },
  { icon: Gift, title: "Gyors feladás", sub: "24 órán belül", justify: "md:justify-center" },
  { icon: Shield, title: "Biztonságos vásárlás", sub: "Garantáltan", justify: "md:justify-end" },
];

export function DeliveryInfoBar() {
  return (
    <section className="bg-brand-50 border-y border-brand-border py-6" data-testid="delivery-info-bar">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {items.map(({ icon: Icon, title, sub, justify }) => (
            <div key={title} className={`flex items-center gap-4 ${justify}`}>
              <div className="w-14 h-14 rounded-full bg-brand flex items-center justify-center shadow-lg">
                <Icon className="w-7 h-7 text-brand-fg" />
              </div>
              <div>
                <h4 className="font-heading font-bold text-brand text-base">{title}</h4>
                <p className="text-brand-muted text-sm">{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
