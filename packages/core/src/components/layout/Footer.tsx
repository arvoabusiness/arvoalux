"use client";

import { useState } from "react";
import Link from "next/link";
import { Globe, Mail } from "lucide-react";
import { toast } from "sonner";
import type { Brand } from "../../types";

const footerColumns = [
  {
    heading: "Ügyfélszolgálat",
    links: [
      { label: "Szállítás és fizetés", to: "#" },
      { label: "Rendelés menete", to: "#" },
      { label: "Panaszok és áruvisszaküldések", to: "#" },
      { label: "Kapcsolat / Elérhetőség", to: "#" },
    ],
  },
  {
    heading: "Információk",
    links: [
      { label: "Ajándékutalványok", to: "#" },
      { label: "Kuponkódok és promóciók", to: "#" },
    ],
  },
  {
    heading: "Rólunk",
    links: [
      { label: "A márka története", to: "#" },
      { label: "Vásárlók élményei", to: "#" },
      { label: "Hírszerkesztőség", to: "#" },
    ],
  },
];

const legalLinks = [
  { label: "Vállalati adatok", to: "#" },
  { label: "Feltételek", to: "#" },
  { label: "Sütik", to: "#" },
  { label: "Személyes adatok", to: "#" },
];

export function Footer({ brand }: { brand: Brand }) {
  const [lastName, setLastName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lastName.trim() || !firstName.trim()) return toast.error("Kérjük, töltse ki a nevét!");
    if (!email.trim() || !email.includes("@")) return toast.error("Kérjük, adjon meg egy érvényes e-mail címet!");
    if (!consent) return toast.error("Kérjük, fogadja el az adatkezelési feltételeket!");
    toast.success("Sikeresen feliratkozott hírlevelünkre!");
    setLastName("");
    setFirstName("");
    setEmail("");
    setConsent(false);
  };

  return (
    <footer className="bg-[#fafaf9] mt-auto text-gray-800" data-testid="footer">
      {/* Promo banner */}
      <div className="bg-brand relative overflow-hidden">
        <div className="absolute top-3 left-6 w-12 h-12 rounded-full border-2 border-white/10" />
        <div className="absolute bottom-4 right-10 w-8 h-8 rounded-full border-2 border-white/10" />
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-8 lg:py-10 relative z-10">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-center sm:text-left">
            <div className="flex items-center gap-3">
              <span className="text-5xl lg:text-6xl font-black text-brand-fg tracking-tight leading-none">-10%</span>
              <Mail className="w-10 h-10 lg:w-12 lg:h-12 text-brand-fg/70" strokeWidth={1.5} />
            </div>
            <p className="text-brand-fg/90 text-base lg:text-lg font-medium max-w-md leading-relaxed">
              Használd ki a 10%-os kedvezményt a hírlevélre való feliratkozással!
            </p>
          </div>
        </div>
      </div>

      {/* Newsletter form */}
      <div className="bg-[#f5f4f0]">
        <div className="max-w-[520px] mx-auto px-6 py-12 lg:py-16">
          <h3 className="text-2xl lg:text-[28px] font-bold text-gray-900 text-center mb-3">Maradjunk kapcsolatban!</h3>
          <p className="text-sm lg:text-[15px] text-gray-500 text-center leading-relaxed mb-8">
            Iratkozz fel hírlevelünkre, hogy elsőként értesülj új termékeinkről, ajánlatainkról, kedvezményeinkről.
          </p>
          <form onSubmit={handleNewsletter} className="space-y-4">
            <input type="text" placeholder="Vezetéknév" value={lastName} onChange={(e) => setLastName(e.target.value)}
              className="w-full h-[52px] px-5 text-[15px] bg-white border border-gray-200 rounded-lg text-gray-800 placeholder:text-gray-400 outline-none focus:border-brand focus:ring-1 focus:ring-brand/30 transition-colors" />
            <input type="text" placeholder="Keresztnév" value={firstName} onChange={(e) => setFirstName(e.target.value)}
              className="w-full h-[52px] px-5 text-[15px] bg-white border border-gray-200 rounded-lg text-gray-800 placeholder:text-gray-400 outline-none focus:border-brand focus:ring-1 focus:ring-brand/30 transition-colors" />
            <input type="email" placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full h-[52px] px-5 text-[15px] bg-white border border-gray-200 rounded-lg text-gray-800 placeholder:text-gray-400 outline-none focus:border-brand focus:ring-1 focus:ring-brand/30 transition-colors" />
            <div className="flex items-start gap-3 pt-2">
              <input type="checkbox" id="newsletter-consent" checked={consent} onChange={(e) => setConsent(e.target.checked)}
                className="mt-1 w-[18px] h-[18px] rounded border-gray-300 cursor-pointer accent-[var(--accent)] flex-shrink-0" />
              <label htmlFor="newsletter-consent" className="text-[13px] text-gray-600 leading-relaxed cursor-pointer">
                Elolvastam és elfogadom az{" "}
                <Link href="#" className="text-brand font-semibold underline underline-offset-2 hover:text-brand-dark">Általános szerződési feltételeket</Link>
                {" "}és az{" "}
                <Link href="#" className="text-brand font-semibold underline underline-offset-2 hover:text-brand-dark">Adatkezelési tájékoztatót</Link>.
              </label>
            </div>
            <button type="submit" className="w-full h-[52px] bg-ink hover:bg-ink-dark text-white text-[15px] font-semibold rounded-lg transition-colors mt-2">
              Feliratkozás
            </button>
          </form>
        </div>
      </div>

      {/* Link columns */}
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-x-12 gap-y-10 pt-12 pb-12">
          {footerColumns.map((col, colIdx) => (
            <div key={colIdx}>
              <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-5">{col.heading}</h4>
              <ul className="space-y-3">
                {col.links.map((link, linkIdx) => (
                  <li key={linkIdx}>
                    <Link href={link.to} className="text-[14px] text-gray-600 hover:text-brand transition-colors">{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="border-t border-gray-200" />
      </div>

      {/* Payment + social */}
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="flex flex-col sm:flex-row items-center justify-between py-8 gap-6">
          <div className="flex items-center gap-4">
            <svg viewBox="0 0 48 32" className="h-7 w-auto" aria-label="Visa">
              <rect width="48" height="32" rx="4" fill="#fff" stroke="#e5e7eb" strokeWidth="1" />
              <text x="24" y="20" textAnchor="middle" fontSize="14" fontWeight="bold" fontStyle="italic" fill="#1a1f71">VISA</text>
            </svg>
            <svg viewBox="0 0 48 32" className="h-7 w-auto" aria-label="Mastercard">
              <rect width="48" height="32" rx="4" fill="#fff" stroke="#e5e7eb" strokeWidth="1" />
              <circle cx="19" cy="16" r="8" fill="#eb001b" opacity="0.9" />
              <circle cx="29" cy="16" r="8" fill="#f79e1b" opacity="0.9" />
            </svg>
            <div className="h-7 px-2.5 flex items-center border border-gray-200 rounded bg-white">
              <span className="text-[11px] font-semibold text-gray-800 tracking-tight"> Pay</span>
            </div>
            <div className="h-7 px-2.5 flex items-center border border-gray-200 rounded bg-white">
              <span className="text-[11px] font-semibold text-gray-800 tracking-tight">G Pay</span>
            </div>
          </div>

          <div className="social">
            <a href="#" aria-label="Instagram">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                <path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.7 3.7 0 0 1-1.38-.9 3.7 3.7 0 0 1-.9-1.38c-.16-.42-.36-1.06-.41-2.23C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.42 2.17 8.8 2.16 12 2.16zm0 1.62c-3.15 0-3.5.01-4.74.07-1.14.05-1.76.24-2.17.4-.55.21-.94.47-1.35.88-.41.41-.67.8-.88 1.35-.16.41-.35 1.03-.4 2.17-.06 1.24-.07 1.59-.07 4.74s.01 3.5.07 4.74c.05 1.14.24 1.76.4 2.17.21.55.47.94.88 1.35.41.41.8.67 1.35.88.41.16 1.03.35 2.17.4 1.24.06 1.59.07 4.74.07s3.5-.01 4.74-.07c1.14-.05 1.76-.24 2.17-.4.55-.21.94-.47 1.35-.88.41-.41.67-.8.88-1.35.16-.41.35-1.03.4-2.17.06-1.24.07-1.59.07-4.74s-.01-3.5-.07-4.74c-.05-1.14-.24-1.76-.4-2.17a3.6 3.6 0 0 0-.88-1.35 3.6 3.6 0 0 0-1.35-.88c-.41-.16-1.03-.35-2.17-.4-1.24-.06-1.59-.07-4.74-.07zm0 2.76a5.3 5.3 0 1 1 0 10.6 5.3 5.3 0 0 1 0-10.6zm0 1.62a3.68 3.68 0 1 0 0 7.36 3.68 3.68 0 0 0 0-7.36zm5.48-2.9a1.24 1.24 0 1 1 0 2.48 1.24 1.24 0 0 1 0-2.48z" />
              </svg>
            </a>
            <a href="#" aria-label="Facebook">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                <path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.78-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99A10 10 0 0 0 22 12z" />
              </svg>
            </a>
            <a href="#" aria-label="TikTok">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                <path d="M16.6 5.82a4.28 4.28 0 0 1-1.06-2.82h-3.1v12.35a2.53 2.53 0 0 1-2.53 2.42 2.53 2.53 0 0 1-2.53-2.53 2.53 2.53 0 0 1 3.3-2.41V9.9a5.63 5.63 0 0 0-.77-.05A5.62 5.62 0 0 0 4.3 15.5a5.62 5.62 0 0 0 5.62 5.61 5.62 5.62 0 0 0 5.62-5.61V9.01a7.35 7.35 0 0 0 4.3 1.38V7.28a4.28 4.28 0 0 1-3.24-1.46z" />
              </svg>
            </a>
            <a href="#" aria-label="YouTube">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                <path d="M23.5 6.5a3 3 0 0 0-2.1-2.12C19.55 3.9 12 3.9 12 3.9s-7.55 0-9.4.48A3 3 0 0 0 .5 6.5 31.3 31.3 0 0 0 0 12a31.3 31.3 0 0 0 .5 5.5 3 3 0 0 0 2.1 2.12c1.85.48 9.4.48 9.4.48s7.55 0 9.4-.48a3 3 0 0 0 2.1-2.12A31.3 31.3 0 0 0 24 12a31.3 31.3 0 0 0-.5-5.5zM9.6 15.6V8.4l6.2 3.6-6.2 3.6z" />
              </svg>
            </a>
          </div>
        </div>
      </div>

      {/* Legal bar */}
      <div className="bg-[#f3f2ef]">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <div className="flex flex-col sm:flex-row items-center justify-between py-5 gap-3">
            <div className="flex flex-wrap items-center gap-x-1 gap-y-1 text-xs text-gray-400">
              <span>&copy; {new Date().getFullYear()} {brand.name}</span>
              {legalLinks.map((l, i) => (
                <span key={i} className="flex items-center">
                  <span className="mx-1.5">·</span>
                  <Link href={l.to} className="hover:text-gray-600 transition-colors">{l.label}</Link>
                </span>
              ))}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <Globe className="w-3.5 h-3.5" />
              <span>Magyar</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
