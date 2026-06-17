"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { toast } from "sonner";
import type { Brand } from "../../types";
import { BrandWordmark } from "../brand/BrandWordmark";

const POPUP_IMAGE = "https://images.unsplash.com/photo-1708667027894-6e9481ae1baf?w=600&q=80";

export function NewsletterPopup({ brand }: { brand: Brand }) {
  const [visible, setVisible] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);

  const storageKey = `${brand.handle}-popup-dismissed`;

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(storageKey)) return;
    const timer = setTimeout(() => setVisible(true), 4000);
    return () => clearTimeout(timer);
  }, [storageKey]);

  const close = () => {
    setVisible(false);
    if (typeof window !== "undefined") sessionStorage.setItem(storageKey, "1");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return toast.error("Kérjük, adja meg a nevét!");
    if (!email.trim() || !email.includes("@")) return toast.error("Kérjük, adjon meg egy érvényes e-mail címet!");
    if (!consent) return toast.error("Kérjük, fogadja el az adatkezelési feltételeket!");
    toast.success("Kuponkód elküldve az e-mail címedre!");
    close();
  };

  if (!visible) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-[9998] animate-fade-in" onClick={close} />
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden max-w-[820px] w-full flex max-h-[90vh] animate-slide-in">
          <div className="hidden md:block w-[42%] flex-shrink-0 relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={POPUP_IMAGE} alt={brand.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-brand/40 to-transparent" />
          </div>

          <div className="flex-1 relative px-6 sm:px-10 py-8 sm:py-10 flex flex-col items-center overflow-y-auto">
            <button onClick={close} className="absolute top-4 right-4 w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors" aria-label="Bezárás">
              <X className="w-5 h-5 text-gray-600" />
            </button>

            <h2 className="text-[26px] sm:text-3xl font-extrabold text-gray-900 text-center leading-tight mt-2 mb-2">Jöhet 10% kedvezmény*?</h2>
            <p className="text-[15px] text-gray-500 text-center mb-6">Iratkozz fel és máris a tiéd!</p>

            <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4 sm:space-y-3">
              <div className="flex flex-col gap-4 sm:gap-3">
                <input type="text" placeholder="Név" value={name} onChange={(e) => setName(e.target.value)}
                  className="h-[56px] sm:h-[50px] px-6 text-[16px] sm:text-[15px] bg-[#f0ede6] border border-[#d5d0c5] rounded-full text-gray-800 placeholder:text-gray-400 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-colors" />
                <input type="email" placeholder="Email cím" value={email} onChange={(e) => setEmail(e.target.value)}
                  className="h-[56px] sm:h-[50px] px-6 text-[16px] sm:text-[15px] bg-[#f0ede6] border border-[#d5d0c5] rounded-full text-gray-800 placeholder:text-gray-400 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-colors" />
              </div>

              <div className="flex items-start gap-2.5 pt-1">
                <input type="checkbox" id="popup-consent" checked={consent} onChange={(e) => setConsent(e.target.checked)}
                  className="mt-1 w-[16px] h-[16px] rounded border-gray-300 cursor-pointer accent-[var(--accent)] flex-shrink-0" />
                <label htmlFor="popup-consent" className="text-[13px] text-gray-500 leading-relaxed cursor-pointer">
                  Hozzájárulok, hogy a(z) {brand.name} marketing célú üzeneteket küldjön számomra.
                </label>
              </div>

              <button type="submit" className="w-full h-[56px] sm:h-[52px] bg-brand hover:bg-brand-dark text-brand-fg text-[16px] font-bold rounded-full transition-colors mt-1">
                Kérem a kedvezményt!
              </button>
            </form>

            <Link href="#" className="text-brand text-[13px] font-medium underline underline-offset-2 hover:text-brand-dark mt-5">
              Adatkezelési tájékoztató
            </Link>
            <p className="text-[11px] text-gray-400 text-center mt-3 leading-relaxed max-w-xs">
              *A kedvezmény csak online vásárlás során használható. A kupon más kedvezménnyel nem összevonható.
            </p>
            <div className="mt-5">
              <BrandWordmark name={brand.name} size="sm" link={false} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
