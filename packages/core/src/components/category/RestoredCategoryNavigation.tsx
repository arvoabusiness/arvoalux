"use client";

import { useState } from "react";
import Link from "next/link";
import { Package, ChevronDown, ChevronRight } from "lucide-react";
import type { CollectionSummary } from "../../catalog";
import { restoredCategoryTree, type RestoredCategory } from "../../restoredCategories";

export function LuxCategoryChildren({ category, onNavigate }: { category: RestoredCategory; onNavigate?: () => void }) {
  function children(nodes: RestoredCategory[]) {
    return <ul className="lux-category-children">{nodes.map(node => <li key={node.id} data-category-node={node.handle}>
      <Link prefetch={false} href={`/collections/${node.handle}`} onClick={onNavigate} className="lux-category-link" data-category-handle={node.handle}>{node.title}</Link>
      {node.children.length > 0 && children(node.children)}
    </li>)}</ul>;
  }
  return <><Link prefetch={false} href={`/collections/${category.handle}`} onClick={onNavigate} className="lux-category-link" data-category-handle={category.handle}>Összes termék</Link>{children(category.children)}</>;
}

export function RestoredCategoryNavigation({ collections, onNavigate, compact = false }: { collections: CollectionSummary[]; onNavigate?: () => void; compact?: boolean }) {
  const [expanded, setExpanded] = useState<string | null>(null);
  return <><noscript><nav aria-label="Összes kategória">{restoredCategoryTree(collections).map(category => <LuxCategoryChildren key={category.id} category={category} onNavigate={onNavigate} />)}</nav></noscript><div className={compact ? "lux-category-grid lux-category-compact" : "lux-category-grid"} data-restored-categories>{restoredCategoryTree(collections).map(category => {
    const open = expanded === category.handle;
    const panelId = `lux-${compact ? "compact" : "home"}-${category.handle}`;
    return <div key={category.id} className="lux-category-card" data-category-node={category.handle}>
      <button type="button" onClick={() => setExpanded(open ? null : category.handle)} aria-expanded={open} aria-controls={panelId}>
        <span className="lux-category-icon"><Package size={20} strokeWidth={2} aria-hidden="true" /></span>
        <span className="lux-category-title">{category.title}</span>
        {open ? <ChevronDown size={20} aria-hidden="true" /> : <ChevronRight size={20} aria-hidden="true" />}
      </button>
      <div id={panelId} className="lux-category-expanded" hidden={!open}><LuxCategoryChildren category={category} onNavigate={onNavigate} /></div>
    </div>;
  })}</div></>;
}
