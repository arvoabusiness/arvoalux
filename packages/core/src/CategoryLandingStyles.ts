export const categoryLandingStyles = `
[data-source-category-tree="homepage"] .source-category-card > a { display:flex;align-items:center;gap:12px;width:100%;padding:16px;text-align:left;border-radius:12px;color:inherit;text-decoration:none;min-height:66px; }
[data-source-category-tree="homepage"] .source-category-card > a:hover { box-shadow:0 4px 16px #0000000d; }
.category-landing { max-width:1360px;margin:0 auto 60px;background:#fff;color:#171717; }
.category-landing,.category-landing :is(h1,h2,p,a,button,span) { font-family:Lato,sans-serif !important; }
.category-landing .category-title { font-size:26px;font-weight:800;text-align:center;padding:26px 16px;margin:0;background:#f8f8f8;line-height:1.3; }
.category-landing .category-banner { display:block;width:100%;height:auto;aspect-ratio:2.4/1;object-fit:cover; }
.category-landing .category-content { padding:24px 24px 0; }
.category-landing .category-chips { display:flex;flex-wrap:wrap;gap:12px;margin:0; }
.category-landing .category-chip { display:inline-flex;align-items:center;justify-content:center;min-height:40px;padding:6px 20px;border:2px solid #252525;border-radius:999px;color:#252525;font-size:15px;text-decoration:none;line-height:1.3;text-align:center; }
.category-landing .category-chip:hover { background:var(--panel,#f5f5f5); }
.category-landing .category-more { display:flex;align-items:center;justify-content:center;gap:14px;min-height:44px;padding:8px 24px;margin:0 auto;background:white;border:2px solid #252525;border-radius:8px;color:#252525;font-weight:700;font-size:17px; }
.category-landing .category-more svg { color:#e51d36; }
.category-landing .category-more-divider { position:relative;margin-top:20px; }
.category-landing .category-more-divider::before { content:'';position:absolute;left:0;right:0;top:50%;border-top:1px solid #ddd; }
.category-landing .category-more { position:relative; }
.category-landing .category-toolbar { display:flex;justify-content:space-between;align-items:center;gap:16px;margin:32px 0 22px;min-height:44px; }
.category-landing .category-filter { display:inline-flex;align-items:center;gap:8px;color:#252525;border:0;background:transparent;font-size:18px;font-weight:600;min-height:44px;padding:0;opacity:1; }
.category-landing .category-filter svg { color:#e51d36; }
.category-landing .category-count { color:#737373;font-size:16px;margin:0;text-align:right; }
.category-landing [data-testid="product-grid"] { grid-template-columns:repeat(2,minmax(0,1fr));gap:16px; }
.category-landing .category-page-nav { display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:20px;margin:32px 0;padding:16px; }
.category-landing .category-page-nav a { padding:10px 16px;border:1px solid #252525;border-radius:8px;color:#252525;text-decoration:none; }
.category-landing .category-message { margin:24px 0;color:#525252; }
.category-landing :is(a,button):focus-visible { outline:2px solid #252525;outline-offset:4px; }
@media(min-width:768px) { .category-landing .category-content { padding:32px; } .category-landing [data-testid="product-grid"] { grid-template-columns:repeat(4,minmax(0,1fr));gap:24px; } .category-landing .category-title { font-size:32px; } }
@media(max-width:639px) { [data-source-category-tree="homepage"] .source-category-card > a { gap:8px;padding:12px; } .category-landing .category-title { font-size:22px;padding:20px 12px; } .category-landing .category-content { padding:20px 16px 0; } .category-landing .category-chip { padding:6px 16px;font-size:14px; } }

.category-landing .category-breadcrumb,.category-landing .category-heading-count,.category-landing .category-desktop-controls { display:none; }
@media(max-width:1023px) { .category-landing .category-chip-extra { display:none; } }
@media(min-width:1024px) {
 .category-landing .category-hero { position:relative;height:200px;overflow:hidden;background:#f1f2ed; }
 .category-landing .category-banner { position:absolute;right:0;top:0;width:50%;height:200px;aspect-ratio:auto;object-fit:cover;object-position:center;mask-image:linear-gradient(to right,transparent,#000 24%); }
 .category-landing .category-breadcrumb { position:relative;z-index:1;display:flex;align-items:center;gap:10px;padding:20px 16px 0;font-size:13px; }
 .category-landing .category-breadcrumb a { color:inherit;text-decoration:none; }
 .category-landing .category-breadcrumb span:last-child { font-weight:700; }
 .category-landing .category-heading { position:relative;z-index:1;display:flex;align-items:baseline;gap:12px;padding:20px 16px;max-width:65%; }
 .category-landing .category-title { padding:0;text-align:left;background:transparent;font-size:32px; }
 .category-landing .category-heading-count { display:inline;color:#737373;font-size:14px;white-space:nowrap; }
 .category-landing .category-content { padding:20px 16px 0; }
 .category-landing .category-chips { gap:12px; }
 .category-landing .category-chip { min-height:32px;padding:4px 18px;font-size:14px; }
 .category-landing .category-more-divider,.category-landing .category-count { display:none; }
 .category-landing .category-toolbar { margin:20px 0 18px;padding-top:18px;border-top:1px solid #ddd; }
 .category-landing .category-filter { border:2px solid #252525;border-radius:7px;min-height:40px;padding:6px 16px;font-size:15px; }
 .category-landing .category-desktop-controls { display:flex;align-items:center;gap:14px;margin-left:auto; }
 .category-landing .category-desktop-controls select { font-family:Lato,sans-serif;font-size:13px;background:#fff;color:#252525;border:1px solid #ddd;border-radius:4px;height:40px;padding:0 12px;max-width:260px; }
 .category-landing [data-testid="product-grid"] { gap:28px; }
}
`;
