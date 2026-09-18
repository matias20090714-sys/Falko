"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CURRENCY_RATES, formatCurrency } from "@/lib/currency";
import { getVideoEmbedUrl } from "@/lib/media";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Copy,
  DollarSign,
  ExternalLink,
  Eye,
  FileCode,
  FileText,
  Film,
  Globe,
  Image as ImageIcon,
  Info,
  Link as LinkIcon,
  Lock,
  Percent,
  Plus,
  Rocket,
  Save,
  ShieldCheck,
  Sparkles,
  Store,
  Tag,
  Trash2,
  Upload,
  Video,
  X,
  Zap,
} from "lucide-react";

interface UploadedFileItem {
  id?: string;
  fileName: string;
  fileSizeBytes: number;
  fileType: string;
  storageKey: string;
}

interface EditProductClientProps {
  initialProduct: any;
  categories: any[];
  currentUser: any;
}

const COVER_PRESETS = [
  {
    category: "IA & Tecnología",
    title: "Cyber Neon IA",
    url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80",
  },
  {
    category: "Negocios & Finanzas",
    title: "Growth & Capital",
    url: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800&auto=format&fit=crop&q=80",
  },
  {
    category: "Educación & Cursos",
    title: "Masterclass Pro",
    url: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80",
  },
  {
    category: "Programación & SaaS",
    title: "Clean Code Matrix",
    url: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80",
  },
  {
    category: "Diseño & Creatividad",
    title: "Vibrant Gradient Art",
    url: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=800&auto=format&fit=crop&q=80",
  },
];

export function EditProductClient({
  initialProduct,
  categories,
  currentUser,
}: EditProductClientProps) {
  const router = useRouter();

  // Form states
  const [title, setTitle] = useState(initialProduct.title || "");
  const [shortDescription, setShortDescription] = useState(initialProduct.shortDescription || "");
  const [description, setDescription] = useState(initialProduct.description || "");
  const [price, setPrice] = useState(initialProduct.price?.toString() || "29");
  const [currencyCode, setCurrencyCode] = useState(initialProduct.currencyCode || "USD");
  const [categoryId, setCategoryId] = useState(initialProduct.categoryId || (categories[0]?.id || ""));
  const [guaranteeDays, setGuaranteeDays] = useState(initialProduct.guaranteeDays?.toString() || "7");
  const [status, setStatus] = useState(initialProduct.status || "APPROVED");

  // Media & Landing
  const [coverImageUrl, setCoverImageUrl] = useState(initialProduct.coverImageUrl || "");
  const [videoUrl, setVideoUrl] = useState(initialProduct.videoUrl || "");
  const [demoUrl, setDemoUrl] = useState(initialProduct.demoUrl || "");
  const [salesPageUrl, setSalesPageUrl] = useState(initialProduct.salesPageUrl || "");
  const [salesPageMode, setSalesPageMode] = useState<"falko" | "external">(
    initialProduct.salesPageUrl ? "external" : "falko"
  );
  const [copiedCheckoutLink, setCopiedCheckoutLink] = useState(false);

  // Delivery / Vault
  const [accessUrl, setAccessUrl] = useState(initialProduct.accessUrl || "");
  const [accessInstructions, setAccessInstructions] = useState(initialProduct.accessInstructions || "");
  const [files, setFiles] = useState<UploadedFileItem[]>(
    initialProduct.files?.map((f: any) => ({
      id: f.id,
      fileName: f.fileName,
      fileSizeBytes: f.fileSizeBytes,
      fileType: f.fileType,
      storageKey: f.storageKey,
    })) || []
  );

  // New file input states
  const [newFileName, setNewFileName] = useState("");
  const [newFileMb, setNewFileMb] = useState("10");

  // Affiliates
  const [affiliateEnabled, setAffiliateEnabled] = useState(initialProduct.affiliateEnabled ?? true);
  const [affiliateCommissionPct, setAffiliateCommissionPct] = useState(
    initialProduct.affiliateCommissionPct?.toString() || "30"
  );
  const [affiliateApprovalMode, setAffiliateApprovalMode] = useState(
    initialProduct.affiliateApprovalMode || "AUTO"
  );
  const [affiliateSwipeUrl, setAffiliateSwipeUrl] = useState(initialProduct.affiliateSwipeUrl || "");

  // Marketing Tracking Pixels
  const [metaPixelId, setMetaPixelId] = useState(initialProduct.metaPixelId || "");
  const [googleAnalyticsId, setGoogleAnalyticsId] = useState(initialProduct.googleAnalyticsId || "");
  const [tiktokPixelId, setTiktokPixelId] = useState(initialProduct.tiktokPixelId || "");

  // Submission state
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleAddFile = () => {
    if (!newFileName.trim()) return;
    const mb = parseFloat(newFileMb) || 5;
    const item: UploadedFileItem = {
      fileName: newFileName.trim(),
      fileSizeBytes: Math.round(mb * 1024 * 1024),
      fileType: newFileName.endsWith(".zip") ? "application/zip" : newFileName.endsWith(".pdf") ? "application/pdf" : "application/octet-stream",
      storageKey: `vault/${Date.now()}_${newFileName.trim()}`,
    };
    setFiles([...files, item]);
    setNewFileName("");
    setNewFileMb("10");
  };

  const handleRemoveFile = (idx: number) => {
    setFiles(files.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!title.trim() || !description.trim() || !price || !categoryId) {
      setErrorMsg("Por favor completa los campos requeridos (Título, Descripción, Precio y Categoría).");
      return;
    }

    setIsSaving(true);

    try {
      const payload = {
        id: initialProduct.id,
        title: title.trim(),
        shortDescription: shortDescription.trim() || null,
        description: description.trim(),
        price: parseFloat(price),
        currencyCode,
        categoryId,
        guaranteeDays: parseInt(guaranteeDays) || 7,
        status,
        coverImageUrl: coverImageUrl.trim() || COVER_PRESETS[0].url,
        videoUrl: videoUrl.trim() || null,
        demoUrl: demoUrl.trim() || null,
        salesPageUrl: salesPageMode === "external" && salesPageUrl.trim() ? salesPageUrl.trim() : null,
        accessUrl: accessUrl.trim() || null,
        accessInstructions: accessInstructions.trim() || null,
        affiliateEnabled: Boolean(affiliateEnabled),
        affiliateCommissionPct: parseFloat(affiliateCommissionPct) || 20,
        affiliateApprovalMode,
        affiliateSwipeUrl: affiliateSwipeUrl.trim() || null,
        metaPixelId: metaPixelId.trim() || null,
        googleAnalyticsId: googleAnalyticsId.trim() || null,
        tiktokPixelId: tiktokPixelId.trim() || null,
        files: files.map((f) => ({
          fileName: f.fileName,
          fileSizeBytes: f.fileSizeBytes,
          fileType: f.fileType,
          storageKey: f.storageKey,
        })),
      };

      const res = await fetch("/api/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "No se pudo actualizar el producto.");
      }

      setSuccessMsg("¡Producto actualizado exitosamente!");
      setTimeout(() => {
        router.push("/seller");
        router.refresh();
      }, 1200);
    } catch (err: any) {
      setErrorMsg(err.message || "Error al guardar los cambios.");
    } finally {
      setIsSaving(false);
    }
  };

  const videoPreview = videoUrl ? getVideoEmbedUrl(videoUrl) : null;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <Link
            href="/seller"
            className="inline-flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 mb-2 font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Volver a Mis Productos</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-heading font-black text-white">
            Editar Producto: <span className="gradient-text-falcon">{initialProduct.title}</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Modifica los detalles, precios, enlaces de entrega privada y porcentaje de afiliados.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={`/product/${initialProduct.slug}`}
            target="_blank"
            className="btn-falcon-secondary text-xs py-2 px-4 flex items-center gap-1.5"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Ver en Tienda</span>
          </Link>
        </div>
      </div>

      {/* Alerts */}
      {errorMsg && (
        <div className="bg-rose-950/80 border border-rose-500/50 text-rose-200 text-xs p-4 rounded-2xl flex items-center gap-2.5 shadow-glow">
          <Info className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 text-xs p-4 rounded-2xl flex items-center gap-2.5 shadow-glow">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* ======================================================== */}
        {/* 1. INFORMACIÓN PRINCIPAL & PRECIO                       */}
        {/* ======================================================== */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6">
          <div className="flex items-center gap-2.5 pb-3 border-b border-white/5">
            <div className="w-8 h-8 rounded-xl bg-cyan-950 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Tag className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-heading font-bold text-white">
              1. Información General del Producto
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-slate-300 block">
                Título del Producto *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej: SaaS Boilerplate Pro con Next.js y Supabase"
                className="input-falcon w-full text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 block">
                Categoría *
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="input-falcon w-full text-sm"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 block">
                Estado del Producto
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="input-falcon w-full text-sm"
              >
                <option value="APPROVED">Publicado & Visible en Marketplace</option>
                <option value="DRAFT">Borrador (Oculto)</option>
                <option value="ARCHIVED">Archivado</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 block">
                Precio de Venta *
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400" />
                <input
                  type="number"
                  step="0.01"
                  min="0.5"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="input-falcon w-full text-sm pl-9 font-bold"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 block">
                Moneda de Cobro
              </label>
              <select
                value={currencyCode}
                onChange={(e) => setCurrencyCode(e.target.value)}
                className="input-falcon w-full text-sm"
              >
                {Object.keys(CURRENCY_RATES).map((code) => (
                  <option key={code} value={code}>
                    {code} ({CURRENCY_RATES[code].name})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 block">
                Garantía para el Comprador
              </label>
              <select
                value={guaranteeDays}
                onChange={(e) => setGuaranteeDays(e.target.value)}
                className="input-falcon w-full text-sm"
              >
                <option value="7">7 Días de Garantía</option>
                <option value="14">14 Días de Garantía</option>
                <option value="21">21 Días de Garantía</option>
                <option value="30">30 Días de Garantía (Recomendado)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 block">
                Subtítulo / Resumen Breve
              </label>
              <input
                type="text"
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                placeholder="Una frase impactante que resume tu recurso digital"
                className="input-falcon w-full text-sm"
              />
            </div>

            <div className="md:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-slate-300 block">
                Descripción Completa del Producto *
              </label>
              <textarea
                rows={5}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Explica qué incluye, los beneficios clave, a quién va dirigido y por qué deben comprarlo hoy..."
                className="input-falcon w-full text-sm leading-relaxed"
              />
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* 2. IMAGEN DE PORTADA & VIDEO DEMO                       */}
        {/* ======================================================== */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6">
          <div className="flex items-center gap-2.5 pb-3 border-b border-white/5">
            <div className="w-8 h-8 rounded-xl bg-purple-950 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <ImageIcon className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-heading font-bold text-white">
              2. Portada & Video Demostrativo
            </h2>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 block">
                URL de Imagen de Portada (JPG, PNG o WebP)
              </label>
              <input
                type="url"
                value={coverImageUrl}
                onChange={(e) => setCoverImageUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="input-falcon w-full text-sm"
              />
            </div>

            {/* Quick Presets Selection */}
            <div>
              <span className="text-[11px] font-bold text-slate-400 block mb-2">
                O selecciona una portada prediseñada:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                {COVER_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCoverImageUrl(preset.url)}
                    className={`group relative rounded-xl overflow-hidden aspect-video border text-left transition-all ${
                      coverImageUrl === preset.url
                        ? "border-cyan-400 ring-2 ring-cyan-500/40 scale-105"
                        : "border-white/10 opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img src={preset.url} alt={preset.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 flex items-end p-1.5">
                      <span className="text-[10px] text-white font-bold truncate">{preset.title}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 block">
                  Video / Demo Audiovisual (YouTube, Vimeo o Loom)
                </label>
                <input
                  type="url"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="input-falcon w-full text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 block">
                  Enlace de Previsualización Pública (Demo Externa)
                </label>
                <input
                  type="url"
                  value={demoUrl}
                  onChange={(e) => setDemoUrl(e.target.value)}
                  placeholder="https://midemo.com"
                  className="input-falcon w-full text-sm"
                />
              </div>

              <div className="md:col-span-2 space-y-4 pt-4 border-t border-white/10">
                <div>
                  <label className="text-sm font-bold text-white flex items-center gap-2 mb-1">
                    <Store className="w-4 h-4 text-cyan-400" />
                    <span>¿Dónde prefieres presentar y vender este producto?</span>
                  </label>
                  <p className="text-xs text-slate-400">
                    Elige si deseas usar la tienda oficial automática de FALKO o conectar tu propia web externa.
                  </p>
                </div>

                {/* 2-Card Mode Selector */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {/* Option 1: Tienda Oficial FALKO */}
                  <div
                    onClick={() => setSalesPageMode("falko")}
                    className={`cursor-pointer rounded-2xl p-4 border transition-all relative ${
                      salesPageMode === "falko"
                        ? "bg-cyan-950/40 border-cyan-500 shadow-glow"
                        : "bg-slate-950/50 border-white/5 hover:border-white/20"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Store className="w-4 h-4 text-cyan-400" />
                        <strong className="text-sm text-white">Tienda Oficial FALKO</strong>
                      </div>
                      <span className="text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 rounded-full font-bold">
                        Recomendado
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed mb-3">
                      Página de ventas de alta conversión lista para usar, con video, fotos, FAQs, soporte por WhatsApp, checkout multidivisa y entrega digital automática.
                    </p>
                    <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                      <span className="text-[11px] text-cyan-300 font-semibold">
                        {salesPageMode === "falko" ? "✓ Modo Activo" : "Seleccionar"}
                      </span>
                      <a
                        href={`/product/${initialProduct.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-xs text-slate-300 hover:text-white bg-slate-900 border border-white/10 px-2.5 py-1 rounded-xl flex items-center gap-1.5 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Ver Tienda</span>
                        <ExternalLink className="w-3 h-3 text-slate-400" />
                      </a>
                    </div>
                  </div>

                  {/* Option 2: Mi Propia Web Externa */}
                  <div
                    onClick={() => setSalesPageMode("external")}
                    className={`cursor-pointer rounded-2xl p-4 border transition-all relative ${
                      salesPageMode === "external"
                        ? "bg-purple-950/40 border-purple-500 shadow-glow"
                        : "bg-slate-950/50 border-white/5 hover:border-white/20"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-purple-400" />
                        <strong className="text-sm text-white">Mi Propia Web Externa</strong>
                      </div>
                      <span className="text-[10px] bg-purple-950 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-full font-bold">
                        Personalizada
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed mb-3">
                      Usa tu propia landing page en WordPress, Webflow, Framer o ClickFunnels y conecta tus botones de compra con el checkout seguro de FALKO.
                    </p>
                    <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                      <span className="text-[11px] text-purple-300 font-semibold">
                        {salesPageMode === "external" ? "✓ Modo Activo" : "Seleccionar"}
                      </span>
                      {salesPageUrl && (
                        <a
                          href={salesPageUrl.startsWith("http") ? salesPageUrl : `https://${salesPageUrl}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-xs text-slate-300 hover:text-white bg-slate-900 border border-white/10 px-2.5 py-1 rounded-xl flex items-center gap-1.5 transition-colors"
                        >
                          <Globe className="w-3.5 h-3.5 text-purple-400" />
                          <span>Ver Web Externa</span>
                          <ExternalLink className="w-3 h-3 text-slate-400" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded settings when external web is chosen */}
                {salesPageMode === "external" && (
                  <div className="bg-slate-950/80 p-4 sm:p-5 rounded-2xl border border-purple-500/30 space-y-4 animate-in fade-in-50">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-white flex items-center gap-1.5">
                          <Globe className="w-3.5 h-3.5 text-purple-400" />
                          <span>URL de tu Página de Ventas / Web Externa</span>
                        </label>
                        {salesPageUrl && (
                          <a
                            href={salesPageUrl.startsWith("http") ? salesPageUrl : `https://${salesPageUrl}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-purple-400 hover:underline flex items-center gap-1 font-bold"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>Probar / Abrir Web</span>
                          </a>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="url"
                          value={salesPageUrl}
                          onChange={(e) => setSalesPageUrl(e.target.value)}
                          placeholder="https://tupropiaweb.com/mi-landing"
                          className="input-falcon flex-1 text-sm"
                        />
                        {salesPageUrl && (
                          <a
                            href={salesPageUrl.startsWith("http") ? salesPageUrl : `https://${salesPageUrl}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-falcon-secondary text-xs px-3.5 py-2 flex items-center gap-1.5 shrink-0"
                          >
                            <ExternalLink className="w-3.5 h-3.5 text-purple-400" />
                            <span className="hidden sm:inline">Ver Web</span>
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Direct checkout snippet for their buttons */}
                    <div className="bg-slate-900/90 border border-white/10 rounded-xl p-3.5 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                          <Zap className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Enlace de Checkout para los botones de compra de tu web:</span>
                        </span>
                        {copiedCheckoutLink && (
                          <span className="text-[11px] text-emerald-400 font-bold">
                            ✓ ¡Copiado al portapapeles!
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          readOnly
                          value={`${typeof window !== "undefined" ? window.location.origin : "https://falko.dpdns.org"}/checkout?product=${initialProduct.slug}`}
                          className="input-falcon flex-1 text-xs font-mono bg-slate-950 text-cyan-300 select-all"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const origin = typeof window !== "undefined" ? window.location.origin : "https://falko.dpdns.org";
                            navigator.clipboard.writeText(`${origin}/checkout?product=${initialProduct.slug}`);
                            setCopiedCheckoutLink(true);
                            setTimeout(() => setCopiedCheckoutLink(false), 2500);
                          }}
                          className="btn-falcon-primary text-xs py-2 px-3 flex items-center gap-1.5 shrink-0 font-bold"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copiar</span>
                        </button>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        Pega este enlace en los botones de "Comprar" de tu WordPress/Webflow para que tus clientes vayan directo a pagar sin iniciar sesión ni pedir contraseñas.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* 3. BÓVEDA DIGITAL & ENTREGA DEL PRODUCTO                 */}
        {/* ======================================================== */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-white/5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-950 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Lock className="w-4 h-4" />
              </div>
              <h2 className="text-lg font-heading font-bold text-white">
                3. Entrega & Contenido Digital
              </h2>
            </div>
            <span className="text-[11px] text-slate-400">
              Solo tus archivos y enlaces reales serán entregados
            </span>
          </div>

          <div className="space-y-6">
            {/* Direct Access Link */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 block">
                🔗 Enlace de Acceso Privado (Notion, Google Drive, Discord, Plataforma)
              </label>
              <input
                type="url"
                value={accessUrl}
                onChange={(e) => setAccessUrl(e.target.value)}
                placeholder="https://notion.so/mi-plantilla-privada..."
                className="input-falcon w-full text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 block">
                Instrucciones de Acceso para el Comprador
              </label>
              <textarea
                rows={2}
                value={accessInstructions}
                onChange={(e) => setAccessInstructions(e.target.value)}
                placeholder="Ej: Haz clic en 'Duplicar' en la esquina superior de Notion o solicita acceso con el correo de tu compra."
                className="input-falcon w-full text-sm"
              />
            </div>

            {/* Uploaded Files in FALKO Vault */}
            <div className="space-y-3 pt-2">
              <label className="text-xs font-bold text-slate-300 block">
                📦 Archivos Digitales en Bóveda ({files.length})
              </label>

              {files.length > 0 ? (
                <div className="space-y-2">
                  {files.map((file, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-900/90 border border-white/10 rounded-2xl p-3.5 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-950 border border-white/10 flex items-center justify-center text-cyan-400">
                          <FileCode className="w-4 h-4" />
                        </div>
                        <div>
                          <strong className="text-white block">{file.fileName}</strong>
                          <span className="text-[11px] text-slate-400">
                            {(file.fileSizeBytes / (1024 * 1024)).toFixed(1)} MB • {file.fileType}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveFile(idx)}
                        className="p-2 text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded-xl transition-colors"
                        title="Eliminar este archivo"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic bg-slate-900/50 p-3.5 rounded-2xl border border-white/5">
                  No has agregado archivos descargables directamente a la bóveda (tu producto se entregará mediante el enlace de acceso privado).
                </p>
              )}

              {/* Add File Widget */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-[11px] font-bold text-slate-400 block">
                    Nombre del Archivo:
                  </label>
                  <input
                    type="text"
                    value={newFileName}
                    onChange={(e) => setNewFileName(e.target.value)}
                    placeholder="Ej: Plantilla_Master_v2.zip"
                    className="input-falcon w-full text-xs"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <div className="space-y-1 flex-1">
                    <label className="text-[11px] font-bold text-slate-400 block">
                      Tamaño aprox (MB):
                    </label>
                    <input
                      type="number"
                      value={newFileMb}
                      onChange={(e) => setNewFileMb(e.target.value)}
                      className="input-falcon w-full text-xs"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAddFile}
                    className="btn-falcon-secondary text-xs py-2 px-3 mt-auto h-[38px] flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Agregar</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* 4. PROGRAMA DE AFILIADOS & TRACKING                      */}
        {/* ======================================================== */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-white/5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-purple-950 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <Percent className="w-4 h-4" />
              </div>
              <h2 className="text-lg font-heading font-bold text-white">
                4. Red de Afiliados & Tráfico
              </h2>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={affiliateEnabled}
                onChange={(e) => setAffiliateEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>

          {affiliateEnabled && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-in fade-in duration-200">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 block">
                  Porcentaje de Comisión (%)
                </label>
                <input
                  type="number"
                  min="5"
                  max="90"
                  value={affiliateCommissionPct}
                  onChange={(e) => setAffiliateCommissionPct(e.target.value)}
                  className="input-falcon w-full text-sm font-bold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 block">
                  Modo de Aprobación
                </label>
                <select
                  value={affiliateApprovalMode}
                  onChange={(e) => setAffiliateApprovalMode(e.target.value)}
                  className="input-falcon w-full text-sm"
                >
                  <option value="AUTO">Automático (Cualquiera puede vender)</option>
                  <option value="MANUAL">Manual (Requiere tu aprobación previa)</option>
                </select>
              </div>

              <div className="md:col-span-2 space-y-1.5">
                <label className="text-xs font-bold text-slate-300 block">
                  Carpeta de Materiales para Afiliados (Drive / Dropbox)
                </label>
                <input
                  type="url"
                  value={affiliateSwipeUrl}
                  onChange={(e) => setAffiliateSwipeUrl(e.target.value)}
                  placeholder="https://drive.google.com/drive/folders/..."
                  className="input-falcon w-full text-sm"
                />
              </div>
            </div>
          )}

          {/* Pixels */}
          <div className="pt-4 border-t border-white/5 space-y-4">
            <h4 className="text-xs uppercase font-bold text-slate-400 tracking-wider">
              Píxeles de Conversión & Analítica
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-[11px] text-slate-400 block">Meta Pixel ID:</label>
                <input
                  type="text"
                  value={metaPixelId}
                  onChange={(e) => setMetaPixelId(e.target.value)}
                  placeholder="Ej: 1234567890"
                  className="input-falcon w-full text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] text-slate-400 block">Google Analytics (G-):</label>
                <input
                  type="text"
                  value={googleAnalyticsId}
                  onChange={(e) => setGoogleAnalyticsId(e.target.value)}
                  placeholder="Ej: G-XXXXXXXXXX"
                  className="input-falcon w-full text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] text-slate-400 block">TikTok Pixel ID:</label>
                <input
                  type="text"
                  value={tiktokPixelId}
                  onChange={(e) => setTiktokPixelId(e.target.value)}
                  placeholder="Ej: CXXXXX..."
                  className="input-falcon w-full text-xs"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4">
          <Link
            href="/seller"
            className="btn-falcon-secondary w-full sm:w-auto text-xs py-3 px-6"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={isSaving}
            className="btn-falcon-primary w-full sm:w-auto text-xs py-3 px-8 shadow-glow flex items-center justify-center gap-2 font-bold"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? "Guardando Cambios..." : "Guardar Cambios"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
