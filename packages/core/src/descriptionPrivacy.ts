import sanitizeHtml from "sanitize-html";
import media from "./description-media.json";

const copies: Record<string, string> = media;

// ArvoaLux-only SSR boundary: no browser-side lazy replacement or proxy fetch.
// The immutable local copies preserve original image bytes, including tables.
export function minimizeDescriptionMedia(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: [...sanitizeHtml.defaults.allowedTags, "img"],
    allowedAttributes: {
      a: ["href", "title", "rel"],
      img: ["src", "alt", "width", "height"],
      th: ["colspan", "rowspan", "scope"],
      td: ["colspan", "rowspan"],
      ol: ["start", "reversed", "type"],
    },
    allowedSchemes: ["https", "http", "mailto", "tel"],
    allowedSchemesByTag: { img: ["https", "data"] },
    allowProtocolRelative: false,
    transformTags: {
      img: (_tag, attrs) => {
        const src = attrs.src || "";
        let safe = Object.prototype.hasOwnProperty.call(copies, src) ? copies[src] : "";
        // Only passive raster data URLs and Shopify's normal media path survive.
        if (/^data:image\/(?:png|jpeg|gif|webp);base64,[a-zA-Z0-9+/=]+$/.test(src)) safe = src;
        try {
          const url = new URL(src);
          if (url.protocol === "https:" && url.hostname === "cdn.shopify.com" &&
              !url.username && !url.password && !url.port && url.pathname.startsWith("/s/files/")) safe = src;
        } catch { /* Relative/unrecognised sources are not fetched. */ }
        if (!safe) return { tagName: "span", attribs: {}, text: `${attrs.alt ? attrs.alt + " – " : ""}A leírás képe nem érhető el ezen a felületen.` };
        return { tagName: "img", attribs: { src: safe, alt: attrs.alt || "",
          ...( /^\d+$/.test(attrs.width || "") ? { width: attrs.width } : {}),
          ...( /^\d+$/.test(attrs.height || "") ? { height: attrs.height } : {}) } };
      },
      a: (_tag, attrs) => ({ tagName: "a", attribs: { href: attrs.href || "", ...(attrs.title ? { title: attrs.title } : {}), rel: "noopener noreferrer" } }),
    },
  });
}
