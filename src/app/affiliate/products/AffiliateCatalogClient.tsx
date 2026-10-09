"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { formatCurrency, convertCurrency } from "@/lib/currency";
import { Package, Percent, Search, Share2, Sparkles, Star, TrendingUp, Zap } from "lucide-react";

interface AffiliateCatalogClientProps {
  products: any[];
}

export function AffiliateCatalogClient({ products }: AffiliateCatalogClientProps) {
  const [currency, setCurrency] = useState("USD");
  const [formatFilter, setFormatFilter] = useState<"ALL" | "DIGITAL" | "PHYSICAL">("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("falko_currency");
    if (saved) setCurrency(saved);

    const handleCurrencyChange = (e: any) => {
      setCurrency(e.detail);
    };

    window.addEventListener("currencyChange", handleCurrencyChange);
    return () => window.removeEventListener("currencyChange", handleCurrencyChange);
  }, []);

  const digitalCount = products.filter((p) => p.productType !== "PHYSICAL").length;
  const physicalCount = products.filter((p) => p.productType === "PHYSICAL").length;

  const filteredProducts = products.filter((p) => {
    const isPhysical = p.productType === "PHYSICAL";
    if (formatFilter === "DIGITAL" && isPhysical) return false;
    if (formatFilter === "PHYSICAL" && !isPhysical) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = p.title?.toLowerCase().includes(q);
      const matchCategory = p.category?.name?.toLowerCase().includes(q);
      const matchDesc = (p.shortDescription || p.description || "").toLowerCase().includes(q);
      if (!matchTitle && !matchCategory && !matchDesc) return false;
    }

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Filters and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
        {/* Format Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900/90 border border-white/10 rounded-2xl w-fit">
          <button
            type="button"
            onClick={() => setFormatFilter("ALL")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              formatFilter === "ALL"
                ? "bg-purple-600 text-white shadow-glow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Todos ({products.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setFormatFilter("DIGITAL")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              formatFilter === "DIGITAL"
                ? "bg-purple-600 text-white shadow-glow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-cyan-300" />
            <span>Digitales ({digitalCount})</span>
          </button>
          <button
            type="button"
            onClick={() => setFormatFilter("PHYSICAL")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              formatFilter === "PHYSICAL"
                ? "bg-purple-600 text-white shadow-glow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Package className="w-3.5 h-3.5 text-amber-300" />
            <span>Físicos ({physicalCount})</span>
          </button>
        </div>

        {/* Search input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por título o categoría..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900/90 border border-white/10 rounded-2xl pl-9 pr-3 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
          />
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="text-center py-16 glass-panel rounded-3xl border border-white/10 space-y-3">
          <Package className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-sm font-bold text-white">No se encontraron productos</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            No hay productos que coincidan con los filtros seleccionados en este momento.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-4.5">
          {filteredProducts.map((p) => {
            const isPhysical = p.productType === "PHYSICAL";
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
                    <div className="absolute top-2 left-2 flex items-center gap-1">
                      <span className="bg-slate-950/90 backdrop-blur-md text-[9px] sm:text-[10px] font-bold text-cyan-300 px-2 py-0.5 rounded border border-slate-800 truncate max-w-[100px]">
                        {p.category?.name || "General"}
                      </span>
                      <span
                        className={`text-[9px] sm:text-[10px] font-black px-1.5 py-0.5 rounded backdrop-blur-md border ${
                          isPhysical
                            ? "bg-amber-950/90 text-amber-300 border-amber-600/60"
                            : "bg-cyan-950/90 text-cyan-300 border-cyan-600/60"
                        }`}
                      >
                        {isPhysical ? "📦 Físico" : "⚡ Digital"}
                      </span>
                    </div>
                    <div className="absolute top-2 right-2 bg-purple-950/90 backdrop-blur-md text-[9px] sm:text-[10px] font-bold text-purple-300 px-2 py-0.5 rounded-lg border border-purple-800/80 flex items-center gap-0.5 shadow-md">
                      <Percent className="w-2.5 h-2.5" />
                      <span>{p.affiliateCommissionPct}%</span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-3 sm:p-3.5 space-y-1.5">
                    <h3 className="text-xs sm:text-sm font-bold text-white line-clamp-2 leading-snug">
                      {p.title}
                    </h3>
                    {(() => {
                      const rawDesc = p.shortDescription || p.description || "";
                      const cleanText = rawDesc.replace(/\s+/g, " ").trim();
                      const isLong = cleanText.length > 90;
                      const truncated = isLong ? `${cleanText.slice(0, 90).trim()}...` : cleanText;
                      return (
                        <p className="text-[11px] sm:text-xs text-slate-400 line-clamp-2 leading-relaxed" title={cleanText}>
                          {truncated}
                        </p>
                      );
                    })()}

                    {isPhysical && p.stock !== null && (
                      <span className="text-[10px] text-slate-400 block font-mono">
                        📦 Stock: <strong className="text-emerald-400">{p.stock}</strong> u.
                      </span>
                    )}
                  </div>
                </div>

                {/* Footer metrics & CTA */}
                <div className="p-3 sm:p-3.5 pt-0 space-y-2">
                  <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-2 sm:p-2.5 space-y-1 text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Precio:</span>
                      <span className="font-mono text-white font-bold">
                        {formatCurrency(convertedPrice, currency)}
                      </span>
                    </div>
                    <div className="flex justify-between text-purple-400 font-bold">
                      <span>Comisión:</span>
                      <span className="font-mono font-black text-xs">
                        +{formatCurrency(convertedEarning, currency)}
                      </span>
                    </div>
                  </div>

                  <Link
                    href={`/product/${p.slug}`}
                    className="btn-falcon-primary w-full text-center justify-center text-[10px] sm:text-xs py-1.5 px-2 shadow-glow font-bold flex items-center gap-1 truncate"
                  >
                    <Share2 className="w-3 h-3 shrink-0" />
                    <span className="truncate">Promocionar ({p.affiliateCommissionPct}%)</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
