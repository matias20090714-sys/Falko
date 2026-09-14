"use client";

import React, { useState } from "react";
import Link from "next/link";
import { formatCurrency } from "@/lib/currency";
import { Check, Copy, ExternalLink, MousePointerClick, Percent, Share2 } from "lucide-react";

export function AffiliateClient({
  affiliateProducts,
  affiliateCode,
}: {
  affiliateProducts: any[];
  affiliateCode: string;
}) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyLink = (productSlug: string, uniqueRefCode: string, id: string) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "https://falko.io";
    const url = `${origin}/product/${productSlug}?ref=${uniqueRefCode}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  if (affiliateProducts.length === 0) {
    return (
      <div className="text-center py-10 text-slate-400 text-xs">
        Aún no tienes enlaces de afiliado generados.{" "}
        <Link href="/affiliate/products" className="text-cyan-400 font-bold hover:underline">
          Explora los productos del marketplace
        </Link>{" "}
        y comienza a ganar comisiones de hasta 50%.
      </div>
    );
  }

  return (
    <div className="divide-y divide-slate-800">
      {affiliateProducts.map((item) => {
        const isCopied = copiedId === item.id;
        const convRate =
          item.clicksCount > 0 ? ((item.conversionsCount / item.clicksCount) * 100).toFixed(1) : "0.0";
        const estimatedEarning = (item.product.price * item.product.affiliateCommissionPct) / 100;

        return (
          <div
            key={item.id}
            className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-900/30 transition-colors"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-12 h-12 rounded-xl bg-slate-900 overflow-hidden border border-slate-800 shrink-0">
                <img src={item.product.coverImageUrl} alt="" className="w-full h-full object-cover" />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-sm text-white truncate max-w-[280px]">
                    {item.product.title}
                  </h4>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${
                      item.status === "APPROVED"
                        ? "bg-emerald-950 text-emerald-400 border-emerald-800"
                        : "bg-amber-950 text-amber-400 border-amber-800"
                    }`}
                  >
                    {item.status}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 mt-1">
                  <span className="text-purple-400 font-bold font-mono">
                    {item.product.affiliateCommissionPct}% ({formatCurrency(estimatedEarning, item.product.currencyCode)}/venta)
                  </span>
                  <span>•</span>
                  <span>Clics: <strong className="text-white">{item.clicksCount}</strong></span>
                  <span>•</span>
                  <span>Ventas: <strong className="text-white">{item.conversionsCount}</strong> ({convRate}%)</span>
                </div>
              </div>
            </div>

            {/* Link Copy Bar */}
            <div className="flex items-center gap-2 shrink-0">
              {item.status === "APPROVED" ? (
                <>
                  <div className="bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-lg text-xs font-mono text-slate-300 max-w-[200px] truncate hidden sm:block">
                    ref={item.uniqueRefCode}
                  </div>
                  <button
                    onClick={() => copyLink(item.product.slug, item.uniqueRefCode, item.id)}
                    className="btn-falcon-primary text-xs py-1.5 px-3.5 shadow-glow"
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5 text-black" /> : <Copy className="w-3.5 h-3.5 text-black" />}
                    {isCopied ? "¡Enlace Copiado!" : "Copiar Enlace"}
                  </button>
                  <Link
                    href={`/product/${item.product.slug}?ref=${item.uniqueRefCode}`}
                    target="_blank"
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </>
              ) : (
                <span className="text-xs text-amber-400 italic">En espera de autorización</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
