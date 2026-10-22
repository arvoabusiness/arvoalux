"use client";

import { categoryLandingStyles } from "../../CategoryLandingStyles";
import Link from "next/link";
import { Tag, Tablets, Gift, Stethoscope, FlaskConical, Droplets, Heart, Brush, Lock, ShieldCheck, Activity, Bug, Bandage, Dog, Store, ChevronRight , Leaf, Sparkles, HeartPulse, Wind, Thermometer} from "lucide-react";
import { sourceCategoryTree, sourceCategoryDestination, type SourceCategoryNode } from "../../sourceCategoryTree";
import type { CollectionSummary } from "../../catalog";

const homepageIcons = { Tag, Tablets, Gift, Stethoscope, FlaskConical, Droplets, Heart, Brush, Lock, ShieldCheck, Activity, Bug, Bandage, Dog, Store , Leaf, Sparkles, HeartPulse, Wind, Thermometer};
export type SourceParent = SourceCategoryNode & { iconHomepage: string; iconDrawer: string; isHighlighted?: boolean; children: SourceParent[] };
export function navigationTree(_collections: CollectionSummary[]): SourceParent[] {
  // Presentation groups are the approved design, not claimed Shopify parent edges.
  return sourceCategoryTree.map(parent=>({...parent,children:parent.children.map(child=>({...child,iconHomepage:parent.iconHomepage,iconDrawer:parent.iconDrawer}))})) as SourceParent[];
}

export function SourceCategoryLink({ node, collections, promotion = false, children, onNavigate }: {
  node: SourceCategoryNode; collections: CollectionSummary[]; promotion?: boolean; children?: React.ReactNode; onNavigate?: () => void;
}) {
  const href = promotion ? null : sourceCategoryDestination(node, collections);
  const content = children ?? <span data-source-label>{node.label}</span>;
  return href ? <Link prefetch={false} href={href} onClick={onNavigate} data-source-destination={node.id} className="source-category-link">{content}</Link> :
    <span aria-disabled="true" data-source-destination={node.id} className="source-category-unavailable">{content}<small>{promotion ? "Jelenleg nem elérhető" : "Jelenleg nem elérhető"}</small></span>;
}

export function SourceCategoryChildren({ parent, collections, onNavigate }: { parent: SourceParent; collections: CollectionSummary[]; onNavigate?: () => void }) {
  return <div data-source-children={parent.id}>
    <SourceCategoryLink node={parent} collections={collections} promotion={parent.isHighlighted} onNavigate={onNavigate}>Összes termék</SourceCategoryLink>
    <ul className="source-category-children">
      {parent.children.filter(child => sourceCategoryDestination(child, collections)).map(child => <li key={child.id} data-source-id={child.id} data-source-slug={child.slug}>
        <SourceCategoryLink node={child} collections={collections} promotion={parent.isHighlighted} onNavigate={onNavigate} />
        {child.children?.length > 0 && <SourceCategoryChildren parent={child} collections={collections} onNavigate={onNavigate} />}
      </li>)}
    </ul>
  </div>;
}

export function SourceCategoryHome({ collections, catalogName = 'Arvoa Lux' }: { collections: CollectionSummary[]; catalogName?: string }) {
  return <section className="py-10 bg-white" data-testid="homepage-category-section" data-source-category-tree="homepage">
    <style>{categoryLandingStyles}</style>
    <div className="max-w-7xl mx-auto px-4">
      <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-6 md:mb-8 tracking-normal text-center sm:text-left">Vásárlás kategória szerint</h2>
      <p className="source-category-note">Válassz kategóriát, és böngészd a teljes kínálatot.</p>
      <div className="source-category-grid">
        {navigationTree(collections).map(cat => {
          const Icon = homepageIcons[cat.iconHomepage as keyof typeof homepageIcons] ?? Store;
          return <div key={cat.id} className="source-category-card" data-source-id={cat.id} data-source-slug={cat.slug} data-testid={`homepage-cat-${cat.slug}`}>
            <Link prefetch={false} href={`/categories/${cat.slug}`} data-testid={`homepage-cat-btn-${cat.slug}`}>
              <span className="source-category-icon" data-source-icon={cat.iconHomepage}><Icon size={20} strokeWidth={2} aria-hidden="true" /></span>
              <span className="source-category-title"><span data-source-label>{cat.label}</span>{cat.slug==='husegakcio'&&<small>Nem aktív</small>}</span>
              
            </Link>
          </div>;
        })}
      </div>
    </div>
  </section>;
}
