"use client";

import { useState } from "react";
import Link from "next/link";
import { Globe, Instagram, Linkedin, Mail } from "lucide-react";
import { toast } from "sonner";
import type { Brand } from "../../types";

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
    </svg>
  );
}

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

const socials = [
  { icon: Instagram, count: "11K", label: "Instagram" },
  { icon: TikTokIcon, count: "3K", label: "TikTok" },
  { icon: Linkedin, count: "15K", label: "LinkedIn" },
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

          <div className="flex items-center gap-5">
            {socials.map((s, i) => {
              const Icon = s.icon;
              return (
                <a key={i} href="#" className="flex items-center gap-1.5 text-gray-500 hover:text-gray-800 transition-colors" aria-label={s.label}>
                  <Icon className="w-5 h-5" />
                  <span className="text-sm font-medium">{s.count}</span>
                </a>
              );
            })}
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
