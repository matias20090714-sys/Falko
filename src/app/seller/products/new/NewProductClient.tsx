"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { CURRENCY_RATES, computeFinancialSplit, formatCurrency } from "@/lib/currency";
import {
  DollarSign,
  FileCode,
  Lock,
  Percent,
  Plus,
  ShieldCheck,
  Sparkles,
  Upload,
  Zap,
} from "lucide-react";

interface NewProductClientProps {
  categories: any[];
  currentUser: any;
}

export function NewProductClient({ categories, currentUser }: NewProductClientProps) {
  const router = useRouter();

  const [formData, setFormData] = useState({
    title: "",
    shortDescription: "",
    description: "",
    price: "49.00",
    currencyCode: "USD",
    categoryId: categories[0]?.id || "",
    guaranteeDays: 7, // Minimum 7
    affiliateEnabled: true,
    affiliateCommissionPct: 30,
    affiliateApprovalMode: "AUTO", // AUTO | MANUAL
    coverImageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80",
    fileName: "paquete_recursos_digitales.zip",
    fileSizeMb: "25",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const numPrice = parseFloat(formData.price) || 0;
  const split = computeFinancialSplit({
    productPrice: numPrice,
    currencyCode: formData.currencyCode,
    affiliateCommissionPct: formData.affiliateEnabled ? formData.affiliateCommissionPct : 0,
    hasAffiliate: formData.affiliateEnabled,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as any;
    if (type === "checkbox") {
      setFormData((prev) => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (numPrice <= 0) {
      setError("El precio debe ser mayor a 0.");
      return;
    }

    if (formData.guaranteeDays < 7) {
      setError("La garantía no puede ser inferior a 7 días según las normas de FALKO.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          files: [
            {
              fileName: formData.fileName,
              fileSizeBytes: (parseFloat(formData.fileSizeMb) || 10) * 1024 * 1024,
              fileType: "application/zip",
            },
          ],
        }),
      });

      const data = await res.json();
      if (data.success) {
        router.push(`/product/${data.product.slug}`);
        router.refresh();
      } else {
        setError(data.error || "Error al crear el producto.");
      }
    } catch {
      setError("Error al conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="bg-rose-950/60 border border-rose-800 text-rose-300 text-xs p-4 rounded-xl">
          {error}
        </div>
      )}

      {/* 1. Basic Info */}
      <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-slate-800 space-y-4">
        <h3 className="text-base font-heading font-bold text-white mb-2">
          1. Información del Producto
        </h3>

        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1">Título del Producto *</label>
          <input
            type="text"
            required
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Ej: Master Prompts para Creadores de Contenido en IA"
            className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1">Subtítulo o Resumen Corto</label>
          <input
            type="text"
            name="shortDescription"
            value={formData.shortDescription}
            onChange={handleChange}
            placeholder="50+ workflows y guías para generar $3,000/mes con automatizaciones."
            className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Categoría *</label>
            <select
              name="categoryId"
              value={formData.categoryId}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-cyan-400"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">URL Imagen de Portada</label>
            <input
              type="url"
              name="coverImageUrl"
              value={formData.coverImageUrl}
              onChange={handleChange}
              placeholder="https://images.unsplash.com/..."
              className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1">Descripción Completa del Contenido *</label>
          <textarea
            required
            rows={5}
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Detalla lo que incluye el producto, a quién va dirigido y cómo utilizarlo..."
            className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs"
          />
        </div>
      </div>

      {/* 2. Pricing & Financial Rules */}
      <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-slate-800 space-y-6">
        <h3 className="text-base font-heading font-bold text-white mb-2 flex items-center justify-between">
          <span>2. Precio, Garantía y Reparto Contable</span>
          <span className="text-xs font-mono text-cyan-400 font-bold bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
            Regla FALKO 25 UYU Base
          </span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Precio Base *</label>
            <input
              type="number"
              step="0.01"
              required
              min="1"
              name="price"
              value={formData.price}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs font-mono font-bold"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Moneda Base</label>
            <select
              name="currencyCode"
              value={formData.currencyCode}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-cyan-400 font-mono"
            >
              {Object.keys(CURRENCY_RATES).map((code) => (
                <option key={code} value={code}>
                  {code} ({CURRENCY_RATES[code].symbol})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Período de Garantía (Mín. 7 días) *
            </label>
            <select
              name="guaranteeDays"
              value={formData.guaranteeDays}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-emerald-400 text-xs focus:outline-none focus:border-cyan-400 font-bold"
            >
              <option value="7">7 Días de Garantía (Estándar)</option>
              <option value="14">14 Días de Garantía (Recomendado)</option>
              <option value="30">30 Días de Garantía (Máxima Confianza)</option>
            </select>
          </div>
        </div>

        {/* Live Financial Breakdown Simulator Box */}
        <div className="bg-slate-950/80 rounded-2xl p-5 border border-cyan-500/30 shadow-glow space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-white border-b border-slate-800 pb-2">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              Simulación Contable por Venta Unitaria
            </span>
            <span className="text-[10px] text-slate-400 font-mono">Calculado en Servidor</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="bg-purple-950/30 border border-purple-900/50 p-3 rounded-xl">
              <span className="text-purple-300 text-[11px] block">Comisión Afiliado ({formData.affiliateEnabled ? formData.affiliateCommissionPct : 0}%)</span>
              <span className="text-base font-black font-mono text-purple-400">
                {formatCurrency(split.affiliateCommissionAmount, formData.currencyCode)}
              </span>
            </div>

            <div className="bg-cyan-950/30 border border-cyan-900/50 p-3 rounded-xl">
              <span className="text-cyan-300 text-[11px] block">Tarifa Plataforma FALKO</span>
              <span className="text-base font-black font-mono text-cyan-400">
                {formatCurrency(split.platformFeeConverted, formData.currencyCode)}
              </span>
            </div>

            <div className="bg-emerald-950/40 border border-emerald-800/60 p-3 rounded-xl">
              <span className="text-emerald-300 text-[11px] block font-bold">Tu Ganancia Neta</span>
              <span className="text-base font-black font-mono text-emerald-400">
                {formatCurrency(split.sellerEarningAmount, formData.currencyCode)}
              </span>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 italic">
            * Los ingresos permanecerán en tu saldo retenido durante los {formData.guaranteeDays} días de garantía y luego pasarán automáticamente a saldo disponible para retiro.
          </p>
        </div>
      </div>

      {/* 3. Affiliate Program Settings */}
      <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-slate-800 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-heading font-bold text-white">
              3. Programa de Afiliados para este Producto
            </h3>
            <p className="text-xs text-slate-400">
              Permite que la red de promotores de FALKO venda tu producto a cambio de una comisión.
            </p>
          </div>
          <input
            type="checkbox"
            name="affiliateEnabled"
            checked={formData.affiliateEnabled}
            onChange={handleChange}
            className="w-5 h-5 accent-cyan-400 cursor-pointer"
          />
        </div>

        {formData.affiliateEnabled && (
          <div className="space-y-4 pt-4 border-t border-slate-800">
            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span>Porcentaje de Comisión para Afiliados:</span>
                <span className="font-mono font-bold text-purple-400">{formData.affiliateCommissionPct}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="80"
                step="5"
                name="affiliateCommissionPct"
                value={formData.affiliateCommissionPct}
                onChange={handleChange}
                className="w-full accent-purple-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>10% (Bajo)</span>
                <span>30% - 50% (Recomendado)</span>
                <span>80% (Ultra High-Ticket)</span>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Modo de Aprobación de Afiliados *</label>
              <div className="grid grid-cols-2 gap-3">
                <label
                  onClick={() => setFormData((prev) => ({ ...prev, affiliateApprovalMode: "AUTO" }))}
                  className={`p-3 rounded-xl border text-xs cursor-pointer ${
                    formData.affiliateApprovalMode === "AUTO"
                      ? "bg-cyan-950/40 border-cyan-500 text-white font-bold"
                      : "bg-slate-900 border-slate-800 text-slate-400"
                  }`}
                >
                  <strong className="block text-cyan-400">Automática (AUTO)</strong>
                  <span className="text-[11px] font-normal">Cualquier afiliado puede generar su enlace de inmediato.</span>
                </label>

                <label
                  onClick={() => setFormData((prev) => ({ ...prev, affiliateApprovalMode: "MANUAL" }))}
                  className={`p-3 rounded-xl border text-xs cursor-pointer ${
                    formData.affiliateApprovalMode === "MANUAL"
                      ? "bg-purple-950/40 border-purple-500 text-white font-bold"
                      : "bg-slate-900 border-slate-800 text-slate-400"
                  }`}
                >
                  <strong className="block text-purple-400">Manual (MANUAL)</strong>
                  <span className="text-[11px] font-normal">El afiliado debe solicitarte autorización previa.</span>
                </label>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 4. Digital File Upload */}
      <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-slate-800 space-y-4">
        <h3 className="text-base font-heading font-bold text-white flex items-center gap-2">
          <FileCode className="w-5 h-5 text-cyan-400" />
          4. Archivo Digital Principal (Bóveda Privada)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Nombre del Archivo *</label>
            <input
              type="text"
              required
              name="fileName"
              value={formData.fileName}
              onChange={handleChange}
              placeholder="paquete_completo.zip"
              className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs font-mono"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Tamaño Estimado (MB)</label>
            <input
              type="number"
              name="fileSizeMb"
              value={formData.fileSizeMb}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs font-mono"
            />
          </div>
        </div>

        <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
          <Lock className="w-3.5 h-3.5 text-cyan-400" />
          Los archivos se sirven mediante tokens criptográficos temporales de 15 minutos sin URLs públicas.
        </p>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="btn-falcon-secondary text-xs py-3 px-6"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="btn-falcon-primary text-sm py-3 px-8 shadow-glow"
        >
          <Zap className="w-4 h-4" />
          {loading ? "Publicando en FALKO..." : "Publicar Producto Ahora"}
        </button>
      </div>
    </form>
  );
}
