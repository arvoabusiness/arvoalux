import Link from "next/link";
import { ArrowRight, Heart, Brain, Shield } from "lucide-react";

const healthCategories = [
  {
    id: "sziv-errendszer",
    title: "Szív- és érrendszer",
    description: "Termékek a szív és az erek egészségének támogatására. Omega-3, CoQ10 és magnézium.",
    icon: Heart,
    query: "omega",
    image: "https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=400&q=80",
  },
  {
    id: "immunrendszer",
    title: "Immunrendszer",
    description: "Erősítsd immunrendszered C és D vitaminnal, cinkkel és probiotikumokkal.",
    icon: Shield,
    query: "vitamin",
    image: "https://images.unsplash.com/photo-1618881158808-8a20f18d516e?w=400&q=80",
  },
  {
    id: "agyi-egeszseg",
    title: "Agyi egészség",
    description: "Támogasd a memóriát és koncentrációt Ginkgo Biloba, Omega-3 és B-vitaminokkal.",
    icon: Brain,
    query: "magnézium",
    image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&q=80",
  },
];

export function HealthCategoriesSection() {
  return (
    <section className="py-12 md:py-16 bg-white" data-testid="health-categories-section">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="font-heading font-bold text-2xl md:text-3xl text-gray-900 mb-3">
            Egészségi problémák szerint
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Válassz kategóriát az egészségi állapotod alapján
          </p>
        </div>

        {/* Desktop grid */}
        <div className="hidden md:grid md:grid-cols-3 gap-6">
          {healthCategories.map((category) => {
            const Icon = category.icon;
            return (
              <Link
                key={category.id}
                href={`/search?q=${encodeURIComponent(category.query)}`}
                className="group rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
                data-testid={`health-card-${category.id}`}
              >
                <div className="relative h-48 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={category.image}
                    alt={category.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-br from-brand to-brand-darker opacity-80" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Icon className="w-16 h-16 text-brand-fg opacity-80" />
                  </div>
                </div>
                <div className="bg-gradient-to-br from-brand to-brand-darker p-6">
                  <h3 className="font-heading font-bold text-xl text-brand-fg mb-2">{category.title}</h3>
                  <p className="text-brand-fg/90 text-sm mb-4 line-clamp-2">{category.description}</p>
                  <span className="inline-flex items-center bg-white/20 hover:bg-white/30 text-brand-fg text-sm font-medium px-4 py-2 rounded-lg transition-colors">
                    A kínálatra <ArrowRight className="w-4 h-4 ml-2" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Mobile horizontal scroll */}
        <div className="md:hidden flex gap-3 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide -mx-4 px-4">
          {healthCategories.map((category) => {
            const Icon = category.icon;
            return (
              <Link
                key={category.id}
                href={`/search?q=${encodeURIComponent(category.query)}`}
                className="group flex-shrink-0 w-[72vw] snap-start rounded-2xl overflow-hidden shadow-lg bg-gradient-to-br from-brand to-brand-darker"
                data-testid={`health-card-mobile-${category.id}`}
              >
                <div className="relative h-44 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={category.image} alt={category.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-br from-brand to-brand-darker opacity-80" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Icon className="w-14 h-14 text-brand-fg opacity-80" />
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-lg text-brand-fg mb-1">{category.title}</h3>
                  <p className="text-brand-fg/90 text-sm mb-3 line-clamp-2">{category.description}</p>
                  <span className="inline-flex items-center bg-white/20 text-brand-fg text-sm font-medium px-4 py-2 rounded-lg">
                    A kínálatra <ArrowRight className="w-4 h-4 ml-2" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
