"use client";

import React, { useState } from "react";
import Link from "next/link";
import { formatCurrency } from "@/lib/currency";
import {
  Check,
  ChevronDown,
  ChevronUp,
  Copy,
  ExternalLink,
  FolderOpen,
  MousePointerClick,
  Percent,
  Share2,
  Sparkles,
  TrendingUp,
  Zap,
} from "lucide-react";

export function AffiliateClient({
  affiliateProducts,
  affiliateCode,
}: {
  affiliateProducts: any[];
  affiliateCode: string;
}) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [subIdMap, setSubIdMap] = useState<Record<string, string>>({});
  const [linkTypeMap, setLinkTypeMap] = useState<Record<string, "landing" | "checkout">>({});
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const getFullAffiliateLink = (productSlug: string, uniqueRefCode: string, itemId: string) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "https://falko.io";
    const subId = subIdMap[itemId]?.trim();
    const type = linkTypeMap[itemId] || "landing";

    let url = "";
    if (type === "checkout") {
      url = `${origin}/checkout?product=${productSlug}&ref=${uniqueRefCode}`;
    } else {
      url = `${origin}/product/${productSlug}?ref=${uniqueRefCode}`;
    }

    if (subId) {
      url += `&src=${encodeURIComponent(subId)}`;
    }

    return url;
  };

  const copyLink = (productSlug: string, uniqueRefCode: string, id: string) => {
    const url = getFullAffiliateLink(productSlug, uniqueRefCode, id);
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  if (affiliateProducts.length === 0) {
    return (
      <div className="text-center py-12 text-slate-400 text-xs glass-panel rounded-2xl border border-white/10">
        <Share2 className="w-10 h-10 text-slate-600 mx-auto mb-3" />
        <p className="mb-4">Aún no tienes enlaces de afiliado generados.</p>
        <Link href="/affiliate/products" className="btn-falcon-primary text-xs py-2 px-4 shadow-glow">
          Explorar Productos del Marketplace
        </Link>
      </div>
    );
  }

  return (
    <div className="divide-y divide-white/5">
      {affiliateProducts.map((item) => {
        const isCopied = copiedId === item.id;
        const isExpanded = expandedId === item.id;
        const convRate =
          item.clicksCount > 0 ? ((item.conversionsCount / item.clicksCount) * 100).toFixed(1) : "0.0";
        const estimatedEarning = (item.product.price * item.product.affiliateCommissionPct) / 100;
        const totalEarned = item.conversionsCount * estimatedEarning;
        const epc = item.clicksCount > 0 ? (totalEarned / item.clicksCount).toFixed(2) : "0.00";

        const currentLink = getFullAffiliateLink(item.product.slug, item.uniqueRefCode, item.id);

        return (
          <div
            key={item.id}
            className="py-5 space-y-3 hover:bg-white/[0.02] transition-colors rounded-2xl px-2 sm:px-4"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-12 h-12 rounded-xl bg-slate-900 overflow-hidden border border-white/10 shrink-0">
                  <img src={item.product.coverImageUrl} alt="" className="w-full h-full object-cover" />
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm text-white truncate max-w-[280px]">
                      {item.product.title}
                    </h4>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
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
                    <span>Ventas: <strong className="text-white">{item.conversionsCount}</strong></span>
                    <span>•</span>
                    <span className="text-emerald-400 font-mono font-bold">
                      EPC: ${epc} USD
                    </span>
                  </div>
                </div>
              </div>

              {/* Link Actions */}
              <div className="flex items-center gap-2 shrink-0">
                {item.status === "APPROVED" ? (
                  <>
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : item.id)}
                      className="btn-falcon-secondary text-xs py-1.5 px-3 flex items-center gap-1 text-slate-300"
                    >
                      <Zap className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Personalizar Enlace</span>
                      {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>

                    <button
                      onClick={() => copyLink(item.product.slug, item.uniqueRefCode, item.id)}
                      className="btn-falcon-primary text-xs py-1.5 px-3.5 shadow-glow"
                    >
                      {isCopied ? <Check className="w-3.5 h-3.5 text-black" /> : <Copy className="w-3.5 h-3.5 text-black" />}
                      {isCopied ? "¡Copiado!" : "Copiar"}
                    </button>

                    <Link
                      href={currentLink}
                      target="_blank"
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </>
                ) : (
                  <span className="text-xs text-amber-400 italic">En revisión por creador</span>
                )}
              </div>
            </div>

            {/* Expanded Advanced Affiliate Panel (SubID, Hotlinks & Swipe Files) */}
            {isExpanded && item.status === "APPROVED" && (
              <div className="bg-slate-950/80 p-4 rounded-2xl border border-purple-900/40 space-y-4 animate-in fade-in duration-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {/* Destination */}
                  <div>
                    <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                      Destino del Enlace (Hotlink)
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setLinkTypeMap((prev) => ({ ...prev, [item.id]: "landing" }))}
                        className={`p-2 rounded-xl border text-center transition-all ${
                          (linkTypeMap[item.id] || "landing") === "landing"
                            ? "bg-cyan-950/60 border-cyan-500 text-cyan-300 font-bold"
                            : "bg-slate-900 border-white/10 text-slate-400"
                        }`}
                      >
                        Página Informativa
                      </button>
                      <button
                        type="button"
                        onClick={() => setLinkTypeMap((prev) => ({ ...prev, [item.id]: "checkout" }))}
                        className={`p-2 rounded-xl border text-center transition-all ${
                          linkTypeMap[item.id] === "checkout"
                            ? "bg-purple-950/60 border-purple-500 text-purple-300 font-bold"
                            : "bg-slate-900 border-white/10 text-slate-400"
                        }`}
                      >
                        Checkout Directo ⚡
                      </button>
                    </div>
                  </div>

                  {/* SubID Tracking */}
                  <div>
                    <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                      Parámetro de Rastreo (SubID / Origen de Campaña)
                    </label>
                    <input
                      type="text"
                      value={subIdMap[item.id] || ""}
                      onChange={(e) => setSubIdMap((prev) => ({ ...prev, [item.id]: e.target.value }))}
                      placeholder="Ej: instagram_bio, tiktok_ad_1, youtube_video"
                      className="w-full px-3 py-2 rounded-xl glass-input text-xs font-mono"
                    />
                  </div>
                </div>

                {/* Generated Link Box */}
                <div className="flex items-center gap-2 bg-slate-900 p-2.5 rounded-xl border border-white/10">
                  <input
                    readOnly
                    value={currentLink}
                    className="bg-transparent text-xs text-slate-300 flex-1 outline-none font-mono truncate"
                  />
                  <button
                    onClick={() => copyLink(item.product.slug, item.uniqueRefCode, item.id)}
                    className="btn-falcon-primary text-[10px] py-1 px-3 shrink-0"
                  >
                    {isCopied ? "Copiado" : "Copiar Enlace Final"}
                  </button>
                </div>

                {/* Swipe Files Link from Creator */}
                {item.product.affiliateSwipeUrl && (
                  <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                    <span className="text-xs text-purple-300 flex items-center gap-1.5 font-semibold">
                      <FolderOpen className="w-4 h-4 text-purple-400" />
                      El creador ha compartido materiales de promoción (banners, copys, videos)
                    </span>
                    <a
                      href={item.product.affiliateSwipeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-falcon-secondary text-[11px] py-1 px-3 text-purple-300 hover:border-purple-500"
                    >
                      Abrir Recursos de Ventas
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
