"use client";

import { useState } from "react";
import { ShoppingBag } from "lucide-react";

type Img = { url: string; altText: string | null };

export function ProductGallery({ images, title }: { images: Img[]; title: string }) {
  const [selected, setSelected] = useState(0);

  return (
    <div>
      <div className="aspect-[100/85] rounded-2xl overflow-hidden border border-gray-100 mb-3 bg-white">
        {images[selected] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={images[selected].url} alt={images[selected].altText ?? title} className="w-full h-full object-contain" data-testid="product-main-image" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <ShoppingBag className="w-20 h-20" />
          </div>
        )}
      </div>
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setSelected(i)}
              className={`flex-shrink-0 w-16 h-16 rounded-lg border-2 overflow-hidden ${i === selected ? "border-brand" : "border-gray-200"}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.url} alt="" className="w-full h-full object-contain p-1" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
