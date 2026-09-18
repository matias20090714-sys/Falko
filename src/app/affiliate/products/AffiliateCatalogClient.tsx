"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { formatCurrency, convertCurrency } from "@/lib/currency";
import { Percent, Share2, ShieldCheck, Sparkles, Star, TrendingUp, Zap } from "lucide-react";

interface AffiliateCatalogClientProps {
  products: any[];
}

export function AffiliateCatalogClient({ products }: AffiliateCatalogClientProps) {
  const [currency, setCurrency] = useState("USD");

  useEffect(() => {
    const saved = localStorage.getItem("falko_currency");
    if (saved) setCurrency(saved);

    const handleCurrencyChange = (e: any) => {
      setCurrency(e.detail);
    };

    window.addEventListener("currencyChange", handleCurrencyChange);
    return () => window.removeEventListener("currencyChange", handleCurrencyChange);
  }, []);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-4.5">
      {products.map((p) => {
        const convertedPrice = convertCurrency(p.price, p.currencyCode, currency);
        const estimatedEarning = (p.price * p.affiliateCommissionPct) / 100;
        const convertedEarning = convertCurrency(estimatedEarning, p.currencyCode, currency);

        return (
          <div
            key={p.id}
            className="glass-panel rounded-2xl overflow-hidden border border-slate-800 flex flex-col justify-between hover:border-purple-500/50 transition-all shadow-md group"
          >
            <div>
              {/* Cover */}
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-900">
                <img
                  src={p.coverImageUrl}
                  alt={p.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-2 left-2 bg-slate-950/80 backdrop-blur-md text-[9px] sm:text-[10px] font-bold text-cyan-300 px-2 py-0.5 rounded border border-slate-800 truncate max-w-[110px]">
                  {p.category.name}
                </div>
                <div className="absolute top-2 right-2 bg-purple-950/90 backdrop-blur-md text-[9px] sm:text-[10px] font-bold text-purple-300 px-2 py-0.5 rounded-lg border border-purple-800/80 flex items-center gap-0.5 shadow-md">
                  <Percent className="w-2.5 h-2.5" />
                  <span>{p.affiliateCommissionPct}%</span>
                </div>
              </div>

              {/* Content */}
              <div className="p-3 sm:p-3.5 space-y-1.5">
                <h3 className="text-xs sm:text-sm font-bold text-white line-clamp-2 leading-snug">{p.title}</h3>
                <p className="text-[11px] sm:text-xs text-slate-400 line-clamp-2 hidden sm:block">{p.shortDescription || p.description}</p>
              </div>
            </div>

            {/* Footer metrics & CTA */}
            <div className="p-3 sm:p-3.5 pt-0 space-y-2">
              <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-2 sm:p-2.5 space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-400">Precio:</span>
                  <span className="font-mono text-white font-bold">{formatCurrency(convertedPrice, currency)}</span>
                </div>
                <div className="flex justify-between text-purple-400 font-bold">
                  <span>Ganancia:</span>
                  <span className="font-mono font-black text-xs">+{formatCurrency(convertedEarning, currency)}</span>
                </div>
              </div>

              <Link
                href={`/product/${p.slug}`}
                className="btn-falcon-primary w-full text-center justify-center text-[10px] sm:text-xs py-1.5 px-2 shadow-glow font-bold flex items-center gap-1 truncate"
              >
                <Share2 className="w-3 h-3 shrink-0" />
                <span className="truncate">Promocionar</span>
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
}
