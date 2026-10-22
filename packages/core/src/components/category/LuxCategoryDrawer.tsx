"use client";

import { useEffect, useRef, useState } from "react";
import { Percent, Pill, HeartHandshake, BriefcaseMedical, Zap, Sparkles, Baby, SmilePlus, PersonStanding, ShieldPlus, HeartPulse, ShieldAlert, Syringe, PawPrint, Package, ChevronRight, ArrowLeft, X , Tablets, Droplets, Leaf, Brush, Bandage, Bug, Wind, Thermometer, Activity, FlaskConical} from "lucide-react";

import type { CollectionSummary } from "../../catalog";
import { navigationTree, SourceCategoryChildren } from "./SourceCategoryTree";

const drawerIcons = { Percent, Pill, HeartHandshake, BriefcaseMedical, Zap, Sparkles, Baby, SmilePlus, PersonStanding, ShieldPlus, HeartPulse, ShieldAlert, Syringe, PawPrint, Package , Tablets, Droplets, Leaf, Brush, Bandage, Bug, Wind, Thermometer, Activity, FlaskConical};

export function LuxCategoryDrawer({ open, onClose, collections }: { open: boolean; onClose: () => void; collections: CollectionSummary[] }) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const back = useRef<HTMLButtonElement>(null);
  const tree = navigationTree(collections);
  const active = tree.find(cat => cat.id === activeId);
  useEffect(() => {
    const element = dialog.current;
    if (open) element?.showModal(); else element?.close();
    return () => element?.close();
  }, [open]);
  useEffect(() => { if (activeId) back.current?.focus(); }, [activeId]);
  const close = () => { setActiveId(null); onClose(); };
  const goBack = () => {
    const id = activeId;
    setActiveId(null);
    // The parent remains mounted; restore keyboard position after mobile panel switch.
    requestAnimationFrame(() => dialog.current?.querySelector<HTMLButtonElement>(`[data-source-id="${id}"]`)?.focus());
  };
  return <dialog ref={dialog} className={`source-category-drawer ${active ? "has-submenu" : ""}`} aria-label="Kategóriák" data-testid="category-drawer" data-source-category-tree="drawer" onKeyDown={event => {
    if (event.key !== 'Tab') return;
    // Hidden mobile parents and unavailable controls are not cycle boundaries.
    const targets = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('button, a[href], input, select, textarea, [tabindex]'))
      .filter(element => element.tabIndex >= 0 && !element.matches(':disabled') && !element.closest('[inert]') && element.getClientRects().length > 0 && getComputedStyle(element).visibility === 'visible');
    const first = targets[0], last = targets[targets.length - 1];
    if (!first) { event.preventDefault(); return; }
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }} onCancel={event => { event.preventDefault(); close(); }} onClick={event => { if (event.target === event.currentTarget) close(); }}>
    <button onClick={close} className="source-category-close" aria-label="Bezárás"><X size={20} /></button>
    <div className="source-category-panels">
      <div className="source-category-parent-panel">
        <h2>Kategóriák</h2>
        <nav data-testid="category-drawer-list">
          {tree.map(cat => {
            const Icon = drawerIcons[cat.iconDrawer as keyof typeof drawerIcons] ?? Package;
            return <button key={cat.id} data-source-id={cat.id} data-source-slug={cat.slug} data-testid={`drawer-cat-${cat.slug}`} onClick={() => setActiveId(activeId === cat.id ? null : cat.id)} aria-expanded={activeId === cat.id}>
              <span data-source-icon={cat.iconDrawer}><Icon size={20} strokeWidth={2} aria-hidden="true" /></span>
              <span className="source-category-title"><span data-source-label>{cat.label}</span></span>
              <ChevronRight size={16} aria-hidden="true" />
            </button>;
          })}
        </nav>
      </div>
      {active && <div className="source-category-submenu" data-testid={`drawer-subcats-${active.slug}`}>
        <button ref={back} onClick={goBack} className="source-category-back" data-testid="category-drawer-back"><ArrowLeft size={16} /> Vissza</button>
        <h3 data-testid="category-drawer-active-title">{active.label}</h3>
        <p className="source-category-note">{active.isHighlighted ? "Jelenleg nincs elérhető ajánlat." : "Válassz alkategóriát, vagy nézd meg az összes terméket."}</p>
        <SourceCategoryChildren parent={active} collections={collections} onNavigate={close} />
      </div>}
    </div>
  </dialog>;
}
