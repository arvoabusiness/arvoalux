import Link from "next/link";
import {
  ArrowRight,
  Shield,
  Bone,
  Heart,
  Leaf,
  Moon,
  Zap,
  Sparkles,
  Droplets,
} from "lucide-react";
import { healthGoals } from "../../healthGoals";

// Icons for the top-8 health goals (by order in the spec). Purely decorative —
// the goal content itself is prop-driven from healthGoals.ts.
const icons = [Shield, Bone, Heart, Leaf, Moon, Zap, Sparkles, Droplets];

export function HealthCategoriesSection() {
  const goals = healthGoals.slice(0, 8);

  return (
    <section className="py-12 md:py-16 bg-white" data-testid="health-categories-section">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="font-heading font-bold text-2xl md:text-3xl text-gray-900 mb-3">
            Vásárlás egészségi cél szerint
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Válassz kategóriát az egészségi célod alapján
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {goals.map((goal, i) => {
            const Icon = icons[i % icons.length];
            return (
              <Link
                key={goal.slug}
                href={`/health-goals/${goal.slug}`}
                className="group flex flex-col rounded-2xl border border-gray-100 bg-[#fafafa] hover:border-brand-border hover:shadow-lg transition-all p-5"
                data-testid={`health-card-${goal.slug}`}
              >
                <span className="w-12 h-12 rounded-full bg-brand-50 flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-brand" strokeWidth={1.8} />
                </span>
                <h3 className="font-heading font-bold text-base text-gray-900 mb-1.5 group-hover:text-brand transition-colors">
                  {goal.title}
                </h3>
                <p className="text-[13px] text-gray-500 leading-snug line-clamp-3 flex-1">
                  {goal.intro}
                </p>
                <span className="inline-flex items-center gap-1 text-brand text-sm font-medium mt-3">
                  A kínálatra <ArrowRight className="w-4 h-4" />
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
