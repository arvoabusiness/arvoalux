import type { ReactNode } from "react";
import type { Brand } from "../types";

export function BrandLayout({ brand, children }: { brand: Brand; children: ReactNode }) {
  const t = brand.theme;
  const vars = {
    "--bg": t.bg,
    "--surface": t.surface,
    "--fg": t.fg,
    "--muted": t.muted,
    "--accent": t.accent,
    "--accent-fg": t.accentFg,
    "--radius": t.radius,
    "--font-display": t.fontDisplay,
    "--font-body": t.fontBody,
  } as React.CSSProperties;

  return (
    <html lang="hu" style={vars}>
      <head>
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="stylesheet" href={t.fontHref} />
        <title>{`${brand.name} — ${brand.tagline}`}</title>
      </head>
      <body>
        <header className="site-header">
          <a href="/" className="wordmark">{brand.name}</a>
          <nav><a href="/cart" className="nav-link">Kosár</a></nav>
        </header>
        {children}
        <footer className="site-footer">
          <span>© {new Date().getFullYear()} {brand.name}</span>
        </footer>
      </body>
    </html>
  );
}
