import type { CollectionSummary } from "./catalog";
import parentSnapshot from "./restoredCategoryParents.json";
// Public navigation-only snapshot of existing Shopify custom.parent relationships.
// Read from the authorized store on 2026-10-06; no collection or product writes.
export type RestoredCategory = CollectionSummary & { children: RestoredCategory[] };
export function restoredCategoryTree(collections: CollectionSummary[]): RestoredCategory[] {
  const fallback: Record<string, string> = parentSnapshot;
  const nodes = new Map(collections.map(c => [c.handle, { ...c, children: [] as RestoredCategory[] }]));
  const parents = new Map(collections.map(c => [c.handle, c.parent ?? fallback[c.handle] ?? null]));
  const roots: RestoredCategory[] = [];
  for (const node of nodes.values()) {
    const parent = parents.get(node.handle);
    let cursor: string | null | undefined = parent;
    const seen = new Set([node.handle]);
    let cycle = false;
    while (cursor && nodes.has(cursor)) {
      if (seen.has(cursor)) { cycle = true; break; }
      seen.add(cursor); cursor = parents.get(cursor);
    }
    if (parent && nodes.has(parent) && !cycle) nodes.get(parent)!.children.push(node);
    else roots.push(node);
  }
  function sort(nodes: RestoredCategory[]) {
    nodes.sort((a,b) => a.title.localeCompare(b.title,"hu"));
    for (const node of nodes) sort(node.children);
  }
  sort(roots);
  return roots;
}
