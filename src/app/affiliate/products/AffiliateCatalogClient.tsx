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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
              <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-900">
                <img
                  src={p.coverImageUrl}
                  alt={p.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md text-[10px] font-bold text-cyan-300 px-2.5 py-0.5 rounded border border-slate-800">
                  {p.category.name}
                </div>
                <div className="absolute top-3 right-3 bg-purple-950/90 backdrop-blur-md text-xs font-bold text-purple-300 px-2.5 py-1 rounded-lg border border-purple-800/80 flex items-center gap-1 shadow-md">
                  <Percent className="w-3.5 h-3.5" />
                  {p.affiliateCommissionPct}% Comisión
                </div>
              </div>

              {/* Content */}
              <div className="p-5 space-y-2">
                <h3 className="text-base font-bold text-white line-clamp-2">{p.title}</h3>
                <p className="text-xs text-slate-400 line-clamp-2">{p.shortDescription || p.description}</p>
              </div>
            </div>

            {/* Footer metrics & CTA */}
            <div className="p-5 pt-0">
              <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3 mb-4 space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Precio Producto:</span>
                  <span className="font-mono text-white font-bold">{formatCurrency(convertedPrice, currency)}</span>
                </div>
                <div className="flex justify-between text-purple-400">
                  <span className="font-semibold">Tu Ganancia por Venta:</span>
                  <span className="font-mono font-black text-sm">+{formatCurrency(convertedEarning, currency)}</span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-800">
                  <span>Modo de Aprobación:</span>
                  <span className="font-bold text-slate-300">
                    {p.affiliateApprovalMode === "AUTO" ? "Automática (Inmediato)" : "Revisión Manual"}
                  </span>
                </div>
              </div>

              <Link
                href={`/product/${p.slug}`}
                className="btn-falcon-primary w-full text-center justify-center text-xs py-2.5 shadow-glow"
              >
                <Share2 className="w-3.5 h-3.5" />
                Obtener Enlace de Afiliado
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
}
