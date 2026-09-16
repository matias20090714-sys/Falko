"use client";

import React, { useState } from "react";
import Link from "next/link";
import { formatCurrency } from "@/lib/currency";
import {
  Check,
  CheckCircle2,
  Copy,
  ExternalLink,
  Percent,
  PlusCircle,
  RefreshCw,
  Settings2,
  ShieldCheck,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  Users,
  X,
  Zap,
} from "lucide-react";

interface ProductItem {
  id: string;
  slug: string;
  title: string;
  price: number;
  currencyCode: string;
  coverImageUrl: string;
  salesCount: number;
  status: string;
  affiliateEnabled: boolean;
  affiliateCommissionPct: number;
  affiliateApprovalMode: string;
  category?: { name: string };
  affiliateProducts?: any[];
}

interface SellerProductsListProps {
  initialProducts: ProductItem[];
}

export function SellerProductsList({ initialProducts }: SellerProductsListProps) {
  const [products, setProducts] = useState<ProductItem[]>(initialProducts);
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);
  const [modalCommPct, setModalCommPct] = useState(30);
  const [modalApprovalMode, setModalApprovalMode] = useState("AUTO");
  const [modalEnabled, setModalEnabled] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState("");
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  const handleToggleAffiliate = async (product: ProductItem) => {
    const newEnabledState = !product.affiliateEnabled;
    setUpdatingId(product.id);

    try {
      const res = await fetch("/api/products", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          affiliateEnabled: newEnabledState,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setProducts((prev) =>
          prev.map((p) => (p.id === product.id ? { ...p, affiliateEnabled: newEnabledState } : p))
        );
        showToast(
          newEnabledState
            ? `¡Afiliación ACTIVADA para "${product.title}"!`
            : `Afiliación desactivada para "${product.title}".`
        );
      } else {
        alert(data.error || "No se pudo actualizar el estado de afiliación.");
      }
    } catch {
      alert("Error de red al actualizar afiliación.");
    } finally {
      setUpdatingId(null);
    }
  };

  const openEditModal = (product: ProductItem) => {
    setEditingProduct(product);
    setModalCommPct(product.affiliateCommissionPct || 30);
    setModalApprovalMode(product.affiliateApprovalMode || "AUTO");
    setModalEnabled(product.affiliateEnabled);
  };

  const handleSaveModalSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    setUpdatingId(editingProduct.id);

    try {
      const res = await fetch("/api/products", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: editingProduct.id,
          affiliateEnabled: modalEnabled,
          affiliateCommissionPct: modalCommPct,
          affiliateApprovalMode: modalApprovalMode,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setProducts((prev) =>
          prev.map((p) =>
            p.id === editingProduct.id
              ? {
                  ...p,
                  affiliateEnabled: modalEnabled,
                  affiliateCommissionPct: modalCommPct,
                  affiliateApprovalMode: modalApprovalMode,
                }
              : p
          )
        );
        setEditingProduct(null);
        showToast("¡Configuración de afiliados actualizada!");
      } else {
        alert(data.error || "Error al guardar cambios.");
      }
    } catch {
      alert("Error de red.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleCopyLink = (slug: string) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "https://falko.io";
    navigator.clipboard.writeText(`${origin}/product/${slug}`);
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 2000);
  };

  if (products.length === 0) {
    return (
      <div className="text-center py-10 text-slate-400 text-xs">
        Aún no has publicado productos. ¡Crea tu primer producto digital para comenzar a facturar!
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="bg-cyan-950/80 border border-cyan-500/50 text-cyan-300 text-xs p-3.5 rounded-2xl flex items-center gap-2 shadow-glow animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="divide-y divide-slate-800">
        {products.map((p) => {
          const isUpdating = updatingId === p.id;

          return (
            <div
              key={p.id}
              className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 group"
            >
              {/* Product Info */}
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-14 h-14 rounded-2xl bg-slate-900 overflow-hidden border border-slate-800 shrink-0 relative">
                  <img src={p.coverImageUrl} alt={p.title} className="w-full h-full object-cover" />
                </div>

                <div className="min-w-0 space-y-1">
                  <h4 className="font-bold text-sm text-white line-clamp-1 group-hover:text-cyan-400 transition-colors">
                    {p.title}
                  </h4>
                  <div className="flex flex-wrap items-center gap-2.5 text-[11px] text-slate-400">
                    <span className="text-cyan-400 font-mono font-bold">
                      {formatCurrency(p.price, p.currencyCode)}
                    </span>
                    <span>•</span>
                    <span className="font-mono text-slate-300">{p.salesCount} ventas</span>
                    <span>•</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                      {p.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Affiliate Interactive Controls */}
              <div className="flex flex-wrap items-center gap-3 shrink-0">
                {/* 1-Click Affiliate Toggle Badge Button */}
                <button
                  type="button"
                  onClick={() => handleToggleAffiliate(p)}
                  disabled={isUpdating}
                  title="Haz clic para activar o desactivar que otros vendan tu producto"
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                    p.affiliateEnabled
                      ? "bg-purple-950/80 border-purple-500/50 text-purple-300 hover:bg-purple-900/80 shadow-sm"
                      : "bg-slate-900/80 border-white/10 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {isUpdating ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                  ) : (
                    <Percent className={`w-3.5 h-3.5 ${p.affiliateEnabled ? "text-purple-400" : "text-slate-500"}`} />
                  )}

                  <span>
                    {p.affiliateEnabled
                      ? `Afiliados: ${p.affiliateCommissionPct}% (${p.affiliateApprovalMode})`
                      : "Afiliados: Desactivado"}
                  </span>

                  <span
                    className={`w-2 h-2 rounded-full ${
                      p.affiliateEnabled ? "bg-purple-400 shadow-[0_0_6px_rgba(168,85,247,1)]" : "bg-slate-600"
                    }`}
                  />
                </button>

                {/* Quick Edit Affiliate Settings Modal Trigger */}
                <button
                  type="button"
                  onClick={() => openEditModal(p)}
                  className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/10 text-slate-300 hover:text-cyan-400 transition-colors"
                  title="Configurar porcentaje y modo de aprobación de afiliados"
                >
                  <Settings2 className="w-3.5 h-3.5" />
                </button>

                {/* Copy Sales Link */}
                <button
                  type="button"
                  onClick={() => handleCopyLink(p.slug)}
                  className="btn-falcon-secondary text-xs py-1.5 px-3 flex items-center gap-1"
                  title="Copiar enlace de venta directa"
                >
                  {copiedSlug === p.slug ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-cyan-400" />}
                  <span>{copiedSlug === p.slug ? "Copiado" : "Link Venta"}</span>
                </button>

                {/* View on Marketplace */}
                <Link
                  href={`/product/${p.slug}`}
                  className="btn-falcon-secondary text-xs py-1.5 px-3 flex items-center gap-1"
                >
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                  <span>Ver Tienda</span>
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* ======================================================== */}
      {/* MODAL: CONFIGURAR AFILIADOS PARA EL PRODUCTO             */}
      {/* ======================================================== */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-purple-500/30 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-950 border border-purple-800/60 flex items-center justify-center text-purple-400">
                  <Percent className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white">Configurar Afiliación</h4>
                  <p className="text-[11px] text-slate-400 truncate max-w-[280px]">
                    {editingProduct.title}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingProduct(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveModalSettings} className="space-y-4">
              {/* Enable Toggle in Modal */}
              <div className="bg-slate-950/70 p-4 rounded-2xl border border-white/10 flex items-center justify-between">
                <div>
                  <strong className="text-xs text-white block">
                    ¿Permitir que otros afiliados vendan este producto?
                  </strong>
                  <span className="text-[11px] text-slate-400">
                    {modalEnabled
                      ? "Activo: los promotores podrán solicitar enlaces y vender."
                      : "Desactivado: solo tú vendes directamente el producto."}
                  </span>
                </div>

                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={modalEnabled}
                    onChange={(e) => setModalEnabled(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>

              {modalEnabled && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  {/* Commission Percentage */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-white">
                        Porcentaje de Comisión: <span className="text-purple-300 font-mono text-sm">{modalCommPct}%</span>
                      </label>
                      <span className="text-xs text-emerald-400 font-mono font-bold">
                        ${((editingProduct.price * modalCommPct) / 100).toFixed(2)} USD / venta
                      </span>
                    </div>

                    <input
                      type="range"
                      min="5"
                      max="80"
                      step="5"
                      value={modalCommPct}
                      onChange={(e) => setModalCommPct(parseInt(e.target.value))}
                      className="w-full accent-purple-500 h-2 bg-slate-800 rounded-lg cursor-pointer mb-2.5"
                    />

                    <div className="flex flex-wrap gap-1.5">
                      {[15, 20, 30, 40, 50, 60, 70, 80].map((pct) => (
                        <button
                          key={pct}
                          type="button"
                          onClick={() => setModalCommPct(pct)}
                          className={`text-xs font-mono font-bold px-2.5 py-1 rounded-lg border transition-all ${
                            modalCommPct === pct
                              ? "bg-purple-600 text-white border-purple-400 shadow-glow"
                              : "bg-slate-950 text-slate-400 border-white/5 hover:text-white"
                          }`}
                        >
                          {pct}%
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Approval Mode Selection */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Modo de Aprobación de Afiliados
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setModalApprovalMode("AUTO")}
                        className={`p-3 rounded-xl border text-left text-xs transition-all ${
                          modalApprovalMode === "AUTO"
                            ? "bg-purple-950/80 border-purple-500 text-white font-bold shadow-sm"
                            : "bg-slate-950 border-white/5 text-slate-400 hover:text-white"
                        }`}
                      >
                        <Zap className="w-3.5 h-3.5 text-amber-400 mb-1" />
                        <span className="block font-bold">⚡ Automática</span>
                        <span className="text-[10px] text-slate-400 block font-normal">Link instantáneo</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setModalApprovalMode("MANUAL")}
                        className={`p-3 rounded-xl border text-left text-xs transition-all ${
                          modalApprovalMode === "MANUAL"
                            ? "bg-purple-950/80 border-purple-500 text-white font-bold shadow-sm"
                            : "bg-slate-950 border-white/5 text-slate-400 hover:text-white"
                        }`}
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-cyan-400 mb-1" />
                        <span className="block font-bold">🛡️ Manual</span>
                        <span className="text-[10px] text-slate-400 block font-normal">Tú apruebas</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="btn-falcon-secondary py-2 px-4 text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={updatingId === editingProduct.id}
                  className="btn-falcon-primary py-2 px-6 text-xs font-bold shadow-glow flex items-center gap-1.5"
                >
                  {updatingId === editingProduct.id ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Check className="w-3.5 h-3.5" />
                  )}
                  <span>Guardar Cambios</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
