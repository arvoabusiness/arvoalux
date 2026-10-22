export const catalogFilterStyles = `
.catalog-filter-dialog { position:fixed;inset:0 0 0 auto;margin:0;border:0;padding:0;width:520px;max-width:100vw;height:100dvh;max-height:100dvh;background:white;color:#252525; }
.catalog-filter-dialog::backdrop { background:#0006; }
.catalog-filter-dialog,.catalog-filter-dialog :is(h2,summary,label,button,input,span,p) { font-family:Lato,sans-serif !important; }
.catalog-filter-dialog .filter-shell { display:flex;flex-direction:column;height:100%; }
.catalog-filter-dialog .filter-header { display:flex;align-items:center;justify-content:space-between;flex-shrink:0;padding:20px 24px;border-bottom:1px solid #eee; }
.catalog-filter-dialog h2 { margin:0;font-size:22px;font-weight:800; }
.catalog-filter-dialog .filter-close { display:grid;place-items:center;min-width:44px;min-height:44px;border:0;background:white;padding:0;color:#252525; }
.catalog-filter-dialog .filter-scroll { min-height:0;flex:1;overflow-y:auto;overscroll-behavior:contain; }
.catalog-filter-dialog .filter-row { border-bottom:1px solid #eee; }
.catalog-filter-dialog summary { list-style:none;display:flex;align-items:center;gap:12px;min-height:56px;padding:12px 24px;cursor:pointer;font-size:18px;font-weight:700; }
.catalog-filter-dialog summary::-webkit-details-marker { display:none; }
.catalog-filter-dialog .filter-preference summary { font-weight:400; }
.catalog-filter-dialog summary > span:first-child { flex:1; }
.catalog-filter-dialog .filter-selected-label { color:#949494;font-size:15px;font-weight:400; }
.catalog-filter-dialog summary svg { color:#e51d36;flex-shrink:0;width:20px;height:20px; }
.catalog-filter-dialog details[open] summary svg { transform:rotate(180deg); }
.catalog-filter-dialog .filter-options { padding:0 24px 16px; }
.catalog-filter-dialog .filter-option { display:flex;align-items:center;gap:12px;min-height:42px;font-size:16px;line-height:1.35;cursor:pointer; }
.catalog-filter-dialog .filter-option > span:nth-of-type(1) { flex:1; }
.catalog-filter-dialog .filter-option input[type=checkbox] { appearance:auto;accent-color:#e51d36;min-height:0;width:17px;height:17px;padding:0; }
.catalog-filter-dialog .filter-option input[type=radio] { position:absolute;opacity:0;width:1px;height:1px; }
.catalog-filter-dialog .filter-option:has(input[type=radio]:checked) { font-weight:700; }
.catalog-filter-dialog .filter-option:has(input:focus-visible) { outline:2px solid #252525;outline-offset:2px; }
.catalog-filter-dialog .filter-option-count { color:#999;font-size:14px;font-weight:400; }
.catalog-filter-dialog .filter-check { width:18px;visibility:hidden; }
.catalog-filter-dialog input:checked ~ .filter-check { visibility:visible; }
.catalog-filter-dialog .filter-empty { color:#858585;font-size:14px;padding:0 24px 18px;margin:0; }
.catalog-filter-dialog .filter-price { padding:0 24px 24px; }
.catalog-filter-dialog .filter-price-inputs { display:flex;justify-content:space-between;gap:12px; }
.catalog-filter-dialog .filter-price-inputs label { display:flex;align-items:center;gap:4px;max-width:45%;font-size:15px; }
.catalog-filter-dialog .filter-price-inputs input { width:110px;max-width:100%;border:1px solid #ddd;border-radius:5px;padding:6px 8px;font-size:16px;min-height:36px;color:#252525; }
.catalog-filter-dialog .filter-range { position:relative;height:30px;margin-top:12px; }
.catalog-filter-dialog .filter-range::before { content:'';position:absolute;inset:13px 0 auto;height:4px;background:#e51d36; }
.catalog-filter-dialog .filter-range input { position:absolute;inset:0;width:100%;height:30px;margin:0;padding:0;border:0;background:transparent;appearance:none;pointer-events:none;min-height:0; }
.catalog-filter-dialog .filter-range input::-webkit-slider-thumb { appearance:none;width:18px;height:18px;border-radius:50%;background:#e51d36;pointer-events:auto;cursor:pointer; }
.catalog-filter-dialog .filter-range input::-moz-range-thumb { width:18px;height:18px;border:0;border-radius:50%;background:#e51d36;pointer-events:auto;cursor:pointer; }
.catalog-filter-dialog .filter-actions { display:flex;gap:16px;flex-shrink:0;padding:16px 24px max(16px,env(safe-area-inset-bottom));border-top:1px solid #eee;background:white; }
.catalog-filter-dialog .filter-actions button { flex:1;min-height:48px;font-size:17px;font-weight:700;border:2px solid #252525;border-radius:8px;padding:8px;background:white;color:#252525; }
.catalog-filter-dialog .filter-actions button[type=submit] { background:#252525;color:white; }
.catalog-filter-dialog :is(button,summary,input):focus-visible { outline:2px solid #252525;outline-offset:3px; }
@media(max-width:639px) { .catalog-filter-dialog { width:100vw; } .catalog-filter-dialog .filter-header { padding:14px 18px; } .catalog-filter-dialog summary { padding:12px 18px;font-size:17px; } .catalog-filter-dialog .filter-options,.catalog-filter-dialog .filter-price { padding-left:18px;padding-right:18px; } .catalog-filter-dialog .filter-actions { padding-left:18px;padding-right:18px;gap:12px; } }
`;
