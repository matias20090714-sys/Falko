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
  ChevronDown,
  Copy,
  DollarSign,
  ExternalLink,
  Eye,
  FileCode,
  FileText,
  Film,
  Globe,
  HelpCircle,
  Image as ImageIcon,
  Info,
  Layers,
  Link as LinkIcon,
  Lock,
  Moon,
  Package,
  Palette,
  Percent,
  Plus,
  RefreshCw,
  Rocket,
  Save,
  ShieldCheck,
  Sliders,
  Sparkles,
  Store,
  Sun,
  Flame,
  Tag,
  Trash2,
  Truck,
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

const BANNER_PRESETS = [
  { name: "Cyber Gradient", url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1600&auto=format&fit=crop&q=80" },
  { name: "Neon Matrix", url: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=1600&auto=format&fit=crop&q=80" },
  { name: "Dark Modern", url: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1600&auto=format&fit=crop&q=80" },
  { name: "Golden Luxury", url: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1600&auto=format&fit=crop&q=80" },
  { name: "Tech Minimal", url: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1600&auto=format&fit=crop&q=80" },
];

export function EditProductClient({
  initialProduct,
  categories,
  currentUser,
}: EditProductClientProps) {
  const router = useRouter();

  // Tab navigation in editor
  const [activeTab, setActiveTab] = useState<"ALL" | "INFO" | "STORE" | "DELIVERY" | "AFFILIATES" | "UPSELL">("ALL");

  // Form states
  const [title, setTitle] = useState(initialProduct.title || "");
  const [shortDescription, setShortDescription] = useState(initialProduct.shortDescription || "");
  const [description, setDescription] = useState(initialProduct.description || "");
  const [price, setPrice] = useState(initialProduct.price?.toString() || "29");
  const [compareAtPrice, setCompareAtPrice] = useState(
    initialProduct.compareAtPrice?.toString() || ""
  );
  const [pricingType, setPricingType] = useState<"ONE_TIME" | "SUBSCRIPTION">(
    initialProduct.pricingType || "ONE_TIME"
  );
  const [billingInterval, setBillingInterval] = useState(
    initialProduct.billingInterval || "MONTHLY"
  );
  const [trialDays, setTrialDays] = useState(
    initialProduct.trialDays?.toString() || "0"
  );
  const [currencyCode, setCurrencyCode] = useState(initialProduct.currencyCode || "USD");
  const [categoryId, setCategoryId] = useState(initialProduct.categoryId || (categories[0]?.id || ""));
  const [guaranteeDays, setGuaranteeDays] = useState(initialProduct.guaranteeDays?.toString() || "7");
  const [status, setStatus] = useState(initialProduct.status || "APPROVED");
  const [storeTheme, setStoreTheme] = useState(initialProduct.storeTheme || "dark");

  // Physical vs Digital product settings
  const [productType, setProductType] = useState<"DIGITAL" | "PHYSICAL">(
    initialProduct.productType || "DIGITAL"
  );
  const [stock, setStock] = useState(
    initialProduct.stock !== null && initialProduct.stock !== undefined
      ? initialProduct.stock.toString()
      : "50"
  );
  const [shippingFee, setShippingFee] = useState(
    initialProduct.shippingFee !== null && initialProduct.shippingFee !== undefined
      ? initialProduct.shippingFee.toString()
      : "0"
  );
  const [estimatedDeliveryDays, setEstimatedDeliveryDays] = useState(
    initialProduct.estimatedDeliveryDays || "24 a 48 hs hábiles"
  );

  // 1-Click Post-Purchase Upsell
  const [upsellTitle, setUpsellTitle] = useState(initialProduct.upsellTitle || "");
  const [upsellDescription, setUpsellDescription] = useState(initialProduct.upsellDescription || "");
  const [upsellPrice, setUpsellPrice] = useState(initialProduct.upsellPrice?.toString() || "");
  const [upsellFileUrl, setUpsellFileUrl] = useState(initialProduct.upsellFileUrl || "");

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

  // Store Visual Customization & Branding
  const [primaryColor, setPrimaryColor] = useState(initialProduct.primaryColor || "#06b6d4");
  const [secondaryColor, setSecondaryColor] = useState(initialProduct.secondaryColor || "#3b82f6");
  const [backgroundColor, setBackgroundColor] = useState(initialProduct.backgroundColor || "#030712");
  const [bannerImageUrl, setBannerImageUrl] = useState(initialProduct.bannerImageUrl || "");
  const [customBadgeText, setCustomBadgeText] = useState(initialProduct.customBadgeText || "");
  const [ctaButtonText, setCtaButtonText] = useState(initialProduct.ctaButtonText || "");
  const [ctaSubtext, setCtaSubtext] = useState(initialProduct.ctaSubtext || "");

  // Highlights / Features list
  const [highlights, setHighlights] = useState<string[]>(() => {
    if (!initialProduct.customHighlights) return [];
    if (Array.isArray(initialProduct.customHighlights)) return initialProduct.customHighlights;
    try {
      const parsed = JSON.parse(initialProduct.customHighlights);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return initialProduct.customHighlights.split("\n").map((s: string) => s.trim()).filter(Boolean);
    }
  });
  const [newHighlight, setNewHighlight] = useState("");

  // Gallery Photos
  const [galleryImages, setGalleryImages] = useState<string[]>(
    initialProduct.images?.map((img: any) => img.imageUrl || img) || []
  );
  const [newImageUrl, setNewImageUrl] = useState("");
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Custom FAQs list
  const [customFaqs, setCustomFaqs] = useState<{ q: string; a: string }[]>(() => {
    if (!initialProduct.customFaqsJson) return [];
    if (Array.isArray(initialProduct.customFaqsJson)) return initialProduct.customFaqsJson;
    try {
      const parsed = JSON.parse(initialProduct.customFaqsJson);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });
  const [newFaqQ, setNewFaqQ] = useState("");
  const [newFaqA, setNewFaqA] = useState("");
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Marketing Tracking Pixels
  const [metaPixelId, setMetaPixelId] = useState(initialProduct.metaPixelId || "");
  const [googleAnalyticsId, setGoogleAnalyticsId] = useState(initialProduct.googleAnalyticsId || "");
  const [tiktokPixelId, setTiktokPixelId] = useState(initialProduct.tiktokPixelId || "");

  // Submission state
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleDeleteProduct = async () => {
    setIsDeleting(true);
    setErrorMsg("");
    try {
      const res = await fetch(`/api/products?id=${initialProduct.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "No se pudo eliminar el producto.");
      }
      setSuccessMsg("¡Producto eliminado exitosamente! Redirigiendo a tus productos...");
      setShowDeleteModal(false);
      setTimeout(() => {
        router.push("/seller");
        router.refresh();
      }, 1000);
    } catch (err: any) {
      setErrorMsg(err.message || "Error al eliminar el producto.");
      setShowDeleteModal(false);
    } finally {
      setIsDeleting(false);
    }
  };

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
        productType,
        stock: productType === "PHYSICAL" ? (parseInt(stock) || 0) : null,
        shippingFee: productType === "PHYSICAL" ? (parseFloat(shippingFee) || 0) : null,
        estimatedDeliveryDays: productType === "PHYSICAL" ? estimatedDeliveryDays.trim() : null,
        requiresShipping: productType === "PHYSICAL",
        price: parseFloat(price),
        compareAtPrice: compareAtPrice ? parseFloat(compareAtPrice) : null,
        pricingType,
        billingInterval: pricingType === "SUBSCRIPTION" ? billingInterval : "MONTHLY",
        trialDays: parseInt(trialDays) || 0,
        currencyCode,
        categoryId,
        guaranteeDays: parseInt(guaranteeDays) || 7,
        status,
        storeTheme,
        primaryColor,
        secondaryColor,
        backgroundColor,
        bannerImageUrl: bannerImageUrl.trim() || null,
        customBadgeText: customBadgeText.trim() || null,
        ctaButtonText: ctaButtonText.trim() || null,
        ctaSubtext: ctaSubtext.trim() || null,
        customHighlights: highlights.length > 0 ? JSON.stringify(highlights) : null,
        customFaqsJson: customFaqs.length > 0 ? JSON.stringify(customFaqs) : null,
        images: galleryImages,
        upsellTitle: upsellTitle.trim() || null,
        upsellDescription: upsellDescription.trim() || null,
        upsellPrice: upsellPrice ? parseFloat(upsellPrice) : null,
        upsellFileUrl: upsellFileUrl.trim() || null,
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

      setSuccessMsg("¡Producto y Tienda actualizados exitosamente!");
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
            Personaliza el diseño de la tienda de este producto, precios, fotos, entregas y afiliados.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={`/product/${initialProduct.slug}`}
            target="_blank"
            className="btn-falcon-primary text-xs py-2 px-4 flex items-center gap-1.5 font-bold shadow-glow"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Ver Tienda en Vivo</span>
            <ExternalLink className="w-3 h-3 opacity-70" />
          </Link>

          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            className="btn-falcon-secondary text-xs py-2 px-3.5 flex items-center gap-1.5 text-rose-400 border-rose-500/30 hover:border-rose-500/70 hover:bg-rose-950/40"
            title="Eliminar este producto permanentemente"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-400" />
            <span className="font-bold">Eliminar</span>
          </button>
        </div>
      </div>

      {/* Interactive Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
        {[
          { id: "ALL", label: "👀 Ver Todo", icon: Layers },
          { id: "INFO", label: "📦 1. Datos & Precio", icon: Tag },
          { id: "STORE", label: "🎨 2. Personalizar Tienda & Diseño", icon: Palette, highlight: true },
          { id: "DELIVERY", label: "🔒 3. Entrega & Bóveda", icon: Lock },
          { id: "AFFILIATES", label: "🤝 4. Afiliados", icon: Percent },
          { id: "UPSELL", label: "⚡ 5. Upsell & Píxeles", icon: Zap },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3.5 py-2 rounded-2xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? tab.highlight
                  ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-glow"
                  : "bg-white/20 text-white border border-white/20 shadow-md"
                : tab.highlight
                ? "bg-cyan-950/60 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-900/50"
                : "bg-slate-900/60 text-slate-400 border border-white/5 hover:border-white/20 hover:text-slate-200"
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            <span>{tab.label}</span>
          </button>
        ))}
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
        {(activeTab === "ALL" || activeTab === "INFO") && (
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6 animate-in fade-in-50">
            <div className="flex items-center gap-2.5 pb-3 border-b border-white/5">
              <div className="w-8 h-8 rounded-xl bg-cyan-950 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Tag className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-lg font-heading font-bold text-white">
                  1. Información General del Producto
                </h2>
                <p className="text-xs text-slate-400">Tipo de producto, título, descripción y modelo de precios</p>
              </div>
            </div>

            {/* Product Type: Physical vs Digital */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-white flex items-center gap-1.5">
                <Package className="w-4 h-4 text-cyan-400" />
                <span>Tipo de Producto *</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div
                  onClick={() => setProductType("DIGITAL")}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3.5 ${
                    productType === "DIGITAL"
                      ? "bg-cyan-950/50 border-cyan-400 ring-2 ring-cyan-500/30 shadow-glow"
                      : "bg-slate-950/60 border-white/10 hover:border-white/20"
                  }`}
                >
                  <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">Producto Digital</span>
                      <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-full font-mono">
                        Instantáneo
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Cursos, plantillas, software, licencias, archivos descargables y accesos privados sin envío.
                    </p>
                  </div>
                </div>

                <div
                  onClick={() => setProductType("PHYSICAL")}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3.5 ${
                    productType === "PHYSICAL"
                      ? "bg-amber-950/50 border-amber-400 ring-2 ring-amber-500/30 shadow-glow"
                      : "bg-slate-950/60 border-white/10 hover:border-white/20"
                  }`}
                >
                  <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">Producto Físico</span>
                      <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-mono">
                        Con Envío
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Prendas, accesorios, hardware, cosmética o artículos tangibles que requieren stock y despacho.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Physical product inventory and shipping settings */}
            {productType === "PHYSICAL" && (
              <div className="bg-amber-950/20 border border-amber-500/30 p-4 sm:p-5 rounded-2xl space-y-4 animate-in fade-in-50">
                <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
                  <Truck className="w-4 h-4" />
                  <span>Logística, Stock e Inventario Físico</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300 block">
                      Stock Disponible (Unidades) *
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={stock}
                      onChange={(e) => setStock(e.target.value)}
                      placeholder="Ej: 50"
                      className="input-falcon w-full text-sm font-mono"
                      required={productType === "PHYSICAL"}
                    />
                    <span className="text-[10px] text-slate-400">
                      Se descuenta automáticamente al completarse cada compra.
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300 block">
                      Costo de Envío ({currencyCode})
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={shippingFee}
                      onChange={(e) => setShippingFee(e.target.value)}
                      placeholder="0.00 (Gratis)"
                      className="input-falcon w-full text-sm font-mono"
                    />
                    <span className="text-[10px] text-slate-400">
                      0 = Envío Gratis destacado con badge verde.
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300 block">
                      Tiempo Estimado de Entrega
                    </label>
                    <input
                      type="text"
                      value={estimatedDeliveryDays}
                      onChange={(e) => setEstimatedDeliveryDays(e.target.value)}
                      placeholder="Ej: 24 a 48 hs hábiles"
                      className="input-falcon w-full text-sm"
                    />
                    <span className="text-[10px] text-slate-400">
                      Visible para el cliente en la página del producto.
                    </span>
                  </div>
                </div>
              </div>
            )}

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
                  placeholder="Ej: Master en Automatización con IA"
                  className="input-falcon w-full text-sm font-bold text-white"
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
                  required
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 block">
                  Garantía Incondicional (Días)
                </label>
                <select
                  value={guaranteeDays}
                  onChange={(e) => setGuaranteeDays(e.target.value)}
                  className="input-falcon w-full text-sm"
                >
                  <option value="0">Sin garantía (Venta final)</option>
                  <option value="7">7 Días de garantía</option>
                  <option value="14">14 Días de garantía</option>
                  <option value="30">30 Días de garantía (Recomendado)</option>
                  <option value="60">60 Días de garantía</option>
                </select>
              </div>

              {/* Pricing settings */}
              <div className="md:col-span-2 bg-slate-950/60 p-4 sm:p-5 rounded-2xl border border-white/5 space-y-4">
                <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider">
                  <DollarSign className="w-4 h-4" />
                  <span>Modelo de Cobro & Divisas</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300 block">
                      Tipo de Cobro
                    </label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setPricingType("ONE_TIME")}
                        className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                          pricingType === "ONE_TIME"
                            ? "bg-cyan-950 border-cyan-400 text-cyan-300 shadow-glow"
                            : "bg-slate-900 border-white/10 text-slate-400 hover:text-white"
                        }`}
                      >
                        Pago Único
                      </button>
                      <button
                        type="button"
                        onClick={() => setPricingType("SUBSCRIPTION")}
                        className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                          pricingType === "SUBSCRIPTION"
                            ? "bg-purple-950 border-purple-400 text-purple-300 shadow-glow"
                            : "bg-slate-900 border-white/10 text-slate-400 hover:text-white"
                        }`}
                      >
                        Suscripción
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300 block">
                      Precio de Venta *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-mono font-bold">
                        {currencyCode === "USD" ? "$" : currencyCode}
                      </span>
                      <input
                        type="number"
                        step="0.01"
                        min="1"
                        required
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        placeholder="29.00"
                        className="input-falcon w-full pl-8 text-sm font-bold font-mono text-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300 block">
                      Precio Tachado / Antes
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-mono">
                        {currencyCode === "USD" ? "$" : currencyCode}
                      </span>
                      <input
                        type="number"
                        step="0.01"
                        value={compareAtPrice}
                        onChange={(e) => setCompareAtPrice(e.target.value)}
                        placeholder="97.00"
                        className="input-falcon w-full pl-8 text-sm font-mono text-slate-400"
                      />
                    </div>
                  </div>
                </div>

                {pricingType === "SUBSCRIPTION" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-white/5">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-300 block">
                        Intervalo de Facturación
                      </label>
                      <select
                        value={billingInterval}
                        onChange={(e) => setBillingInterval(e.target.value)}
                        className="input-falcon w-full text-sm"
                      >
                        <option value="MONTHLY">Mensual (Cada 30 días)</option>
                        <option value="YEARLY">Anual (Cada 365 días)</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-300 block">
                        Días de Prueba Gratis (Trial)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={trialDays}
                        onChange={(e) => setTrialDays(e.target.value)}
                        placeholder="0"
                        className="input-falcon w-full text-sm font-mono"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="md:col-span-2 space-y-1.5">
                <label className="text-xs font-bold text-slate-300 block">
                  Subtítulo / Gancho Rápido (1 línea)
                </label>
                <input
                  type="text"
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  placeholder="Ej: Automatiza tus ventas en 7 pasos con bots y flujos probados"
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
        )}

        {/* ======================================================== */}
        {/* 2. PERSONALIZACIÓN Y DISEÑO DE LA TIENDA                 */}
        {/* ======================================================== */}
        {(activeTab === "ALL" || activeTab === "STORE") && (
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-cyan-500/30 space-y-8 animate-in fade-in-50 relative overflow-hidden">
            {/* Ambient background glow matching chosen colors */}
            <div
              className="absolute -top-32 -right-32 w-80 h-80 rounded-full blur-[100px] opacity-20 pointer-events-none transition-all duration-700"
              style={{ backgroundColor: primaryColor }}
            />

            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-glow transition-all"
                  style={{
                    backgroundColor: primaryColor,
                    boxShadow: `0 0 20px ${primaryColor}40`,
                  }}
                >
                  <Palette className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-heading font-black text-white">
                      2. Personalización y Diseño de tu Tienda
                    </h2>
                    <span className="text-[10px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 px-2 py-0.5 rounded-full font-bold">
                      Personalizable
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Modifica colores, banner hero, textos, insignias, galería de fotos, beneficios y FAQs de este producto.
                  </p>
                </div>
              </div>

              <Link
                href={`/product/${initialProduct.slug}`}
                target="_blank"
                className="btn-falcon-secondary text-xs py-2 px-3.5 flex items-center gap-1.5"
              >
                <Eye className="w-3.5 h-3.5 text-cyan-400" />
                <span>Previsualizar Tienda</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </Link>
            </div>

            {/* LIVE STOREFRONT MINI-PREVIEW CARD */}
            <div
              className="rounded-3xl border p-5 sm:p-6 transition-all duration-500 relative overflow-hidden"
              style={{
                backgroundColor: backgroundColor,
                borderColor: `${primaryColor}40`,
                boxShadow: `0 10px 40px ${primaryColor}15`,
              }}
            >
              {/* Mini Banner Hero Backdrop */}
              {bannerImageUrl && (
                <div className="absolute inset-0 h-32 w-full overflow-hidden opacity-30 pointer-events-none">
                  <img
                    src={bannerImageUrl}
                    alt="Banner Preview"
                    className="w-full h-full object-cover blur-sm"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#030712]" />
                </div>
              )}

              <div className="relative z-10 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" style={{ color: primaryColor }} />
                    <span>Vista Previa en Tiempo Real de tu Tienda</span>
                  </span>
                  <span
                    className="text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider"
                    style={{
                      backgroundColor: `${primaryColor}20`,
                      color: primaryColor,
                      border: `1px solid ${primaryColor}50`,
                    }}
                  >
                    {customBadgeText || "🔥 OFERTA EXCLUSIVA"}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
                  {/* Image thumbnail */}
                  <div className="md:col-span-4 rounded-2xl overflow-hidden aspect-video sm:aspect-square bg-slate-900 border border-white/10 relative">
                    <img
                      src={galleryImages[0] || coverImageUrl || COVER_PRESETS[0].url}
                      alt="Product Cover"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-md px-2 py-1 rounded-lg text-[10px] font-mono text-white flex items-center gap-1">
                      {productType === "PHYSICAL" ? <Truck className="w-3 h-3 text-amber-400" /> : <Sparkles className="w-3 h-3 text-cyan-400" />}
                      <span>{productType === "PHYSICAL" ? "Físico" : "Digital"}</span>
                    </div>
                  </div>

                  {/* Copy, CTA & Highlights */}
                  <div className="md:col-span-8 space-y-3">
                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-white font-heading line-clamp-1">
                        {title || "Título de tu producto"}
                      </h3>
                      <p className="text-xs text-slate-400 line-clamp-2 mt-0.5">
                        {shortDescription || description || "Descripción corta del producto que engancha al cliente..."}
                      </p>
                    </div>

                    <div className="flex items-baseline gap-2">
                      <span className="text-xl sm:text-2xl font-black font-mono text-white">
                        {currencyCode === "USD" ? "$" : currencyCode} {price || "29"}
                      </span>
                      {compareAtPrice && (
                        <span className="text-xs line-through text-slate-500 font-mono">
                          {currencyCode === "USD" ? "$" : currencyCode} {compareAtPrice}
                        </span>
                      )}
                      {productType === "PHYSICAL" && (
                        <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-medium ml-2">
                          {parseFloat(shippingFee) > 0 ? `+ $${shippingFee} envío` : "Envío Gratis"}
                        </span>
                      )}
                    </div>

                    {/* Custom Highlights mini list */}
                    {highlights.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 py-1">
                        {highlights.slice(0, 3).map((hl, i) => (
                          <div key={i} className="flex items-center gap-1.5 text-[11px] text-slate-300">
                            <CheckCircle2 className="w-3 h-3 shrink-0" style={{ color: primaryColor }} />
                            <span className="truncate">{hl}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Custom CTA Button preview */}
                    <div className="space-y-1.5 pt-1">
                      <button
                        type="button"
                        className="w-full py-2.5 px-4 rounded-xl font-bold text-xs text-white flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95"
                        style={{
                          background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
                          boxShadow: `0 4px 20px ${primaryColor}40`,
                        }}
                      >
                        <Zap className="w-4 h-4 fill-white" />
                        <span>
                          {ctaButtonText || (productType === "PHYSICAL" ? "Comprar y Recibir Pedido" : "Comprar con Garantía Protegida")}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                      <p className="text-[10px] text-center text-slate-400">
                        {ctaSubtext || "🔒 Pago seguro cifrado SSL • Garantía incondicional"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* A. PALETA DE COLORES & TEMAS */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-white flex items-center gap-2">
                  <Palette className="w-4 h-4 text-cyan-400" />
                  <span>A. Paleta de Colores & Estilo Visual</span>
                </label>
                <span className="text-[10px] text-slate-400">Selecciona un tema o personaliza con tu propio código HEX</span>
              </div>

              {/* Theme Presets */}
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                {[
                  { name: "Cyber Cyan", p: "#06b6d4", s: "#3b82f6", bg: "#030712", label: "💎 Cyan" },
                  { name: "Royal Purple", p: "#8b5cf6", s: "#ec4899", bg: "#050510", label: "👑 Purple" },
                  { name: "Emerald", p: "#10b981", s: "#059669", bg: "#020e09", label: "🌿 Emerald" },
                  { name: "Sunset Amber", p: "#f59e0b", s: "#ef4444", bg: "#0f0803", label: "🔥 Sunset" },
                  { name: "Neon Rose", p: "#ec4899", s: "#f43f5e", bg: "#0f030a", label: "🌸 Rose" },
                  { name: "Obsidian Gold", p: "#eab308", s: "#ca8a04", bg: "#080808", label: "⚡ Gold" },
                  { name: "Clean Light", p: "#0284c7", s: "#0f172a", bg: "#f8fafc", label: "☀️ Light" },
                ].map((theme) => (
                  <button
                    key={theme.name}
                    type="button"
                    onClick={() => {
                      setPrimaryColor(theme.p);
                      setSecondaryColor(theme.s);
                      setBackgroundColor(theme.bg);
                    }}
                    className={`p-2.5 rounded-xl border text-left transition-all flex items-center justify-between ${
                      primaryColor === theme.p
                        ? "bg-slate-900 border-cyan-400 shadow-glow ring-2 ring-cyan-500/30 text-white font-bold"
                        : "bg-slate-950 border-white/10 hover:border-white/20 text-slate-400"
                    }`}
                  >
                    <span className="text-xs truncate">{theme.label}</span>
                    <div className="w-3.5 h-3.5 rounded-full border border-white/20 shrink-0" style={{ backgroundColor: theme.p }} />
                  </button>
                ))}
              </div>

              {/* Custom Hex Color Pickers */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: primaryColor }} />
                    <span>Color Principal (Botones & Brillos):</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-9 h-9 rounded-lg cursor-pointer bg-transparent border-0"
                    />
                    <input
                      type="text"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="input-falcon text-xs font-mono py-1.5"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: secondaryColor }} />
                    <span>Color Secundario (Gradientes):</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      className="w-9 h-9 rounded-lg cursor-pointer bg-transparent border-0"
                    />
                    <input
                      type="text"
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      className="input-falcon text-xs font-mono py-1.5"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: backgroundColor }} />
                    <span>Color de Fondo de la Página:</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={backgroundColor}
                      onChange={(e) => setBackgroundColor(e.target.value)}
                      className="w-9 h-9 rounded-lg cursor-pointer bg-transparent border-0"
                    />
                    <input
                      type="text"
                      value={backgroundColor}
                      onChange={(e) => setBackgroundColor(e.target.value)}
                      className="input-falcon text-xs font-mono py-1.5"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* B. BANNERS & INSIGNIAS */}
            <div className="space-y-4 pt-4 border-t border-white/10">
              <label className="text-xs font-bold text-white flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-purple-400" />
                <span>B. Banner de Cabecera (Hero Banner) & Insignias</span>
              </label>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs text-slate-300 block">
                    URL de Banner Panorámico (Fondo Hero)
                  </label>
                  <input
                    type="url"
                    value={bannerImageUrl}
                    onChange={(e) => setBannerImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="input-falcon text-xs"
                  />
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <span className="text-[10px] text-slate-500 self-center mr-1">Presets:</span>
                    {BANNER_PRESETS.map((bp, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setBannerImageUrl(bp.url)}
                        className="text-[10px] bg-slate-900 hover:bg-slate-800 text-slate-300 border border-white/10 px-2 py-0.5 rounded-lg transition-colors"
                      >
                        {bp.name}
                      </button>
                    ))}
                    {bannerImageUrl && (
                      <button
                        type="button"
                        onClick={() => setBannerImageUrl("")}
                        className="text-[10px] text-rose-400 hover:text-rose-300 px-1 py-0.5"
                      >
                        Limpiar
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs text-slate-300 block">
                    Texto de la Insignia Superior (Offer Badge)
                  </label>
                  <input
                    type="text"
                    value={customBadgeText}
                    onChange={(e) => setCustomBadgeText(e.target.value)}
                    placeholder="Ej: 🔥 EDICIÓN LIMITADA • 50% OFF LANZAMIENTO"
                    className="input-falcon text-xs"
                  />
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <span className="text-[10px] text-slate-500 self-center mr-1">Ideas:</span>
                    {[
                      "🔥 MÁS VENDIDO",
                      "⚡ ENVÍO GRATIS 24HS",
                      "⭐ 4.9/5 ESTRELLAS",
                      "💎 EXCLUSIVO FALKO",
                    ].map((badgeText, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setCustomBadgeText(badgeText)}
                        className="text-[10px] bg-slate-900 hover:bg-slate-800 text-slate-300 border border-white/10 px-2 py-0.5 rounded-lg transition-colors"
                      >
                        {badgeText}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* C. BOTONES & COPYWRITING DE CONVERSIÓN */}
            <div className="space-y-4 pt-4 border-t border-white/10">
              <label className="text-xs font-bold text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                <span>C. Textos del Botón de Compra (CTA) & Reaseguro</span>
              </label>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-300 block">
                    Texto del Botón de Compra Principal
                  </label>
                  <input
                    type="text"
                    value={ctaButtonText}
                    onChange={(e) => setCtaButtonText(e.target.value)}
                    placeholder={productType === "PHYSICAL" ? "Comprar y Recibir Pedido" : "Comprar con Garantía Protegida"}
                    className="input-falcon text-xs"
                  />
                  <p className="text-[10px] text-slate-400">
                    Mensaje claro y persuasivo que empuja la acción de compra.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-slate-300 block">
                    Subtexto de Confianza / Garantía
                  </label>
                  <input
                    type="text"
                    value={ctaSubtext}
                    onChange={(e) => setCtaSubtext(e.target.value)}
                    placeholder="🔒 Pago 100% seguro cifrado SSL • Garantía incondicional"
                    className="input-falcon text-xs"
                  />
                  <p className="text-[10px] text-slate-400">
                    Aparece justo debajo del botón principal para disipar dudas.
                  </p>
                </div>
              </div>
            </div>

            {/* D. GALERÍA MULTI-FOTOS DEL PRODUCTO */}
            <div className="space-y-4 pt-4 border-t border-white/10">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-white flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-cyan-400" />
                  <span>D. Galería de Fotos Adicionales ({galleryImages.length})</span>
                </label>
                <span className="text-[10px] text-slate-400">Permite a los clientes ver detalles, ángulos o capturas</span>
              </div>

              <div className="flex gap-2">
                <input
                  type="url"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  placeholder="https://ejemplo.com/foto-detalle.jpg"
                  className="input-falcon text-xs flex-1"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (newImageUrl.trim()) {
                      setGalleryImages([...galleryImages, newImageUrl.trim()]);
                      setNewImageUrl("");
                    }
                  }}
                  className="btn-falcon-primary text-xs py-2 px-4 flex items-center gap-1.5 shrink-0 font-bold"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Agregar Foto</span>
                </button>
              </div>

              {galleryImages.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                  {galleryImages.map((img, idx) => (
                    <div key={idx} className="relative group rounded-xl overflow-hidden aspect-square border border-white/10 bg-slate-900">
                      <img src={img} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setGalleryImages(galleryImages.filter((_, i) => i !== idx))}
                        className="absolute top-1.5 right-1.5 bg-rose-600 hover:bg-rose-500 text-white p-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Eliminar foto"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                      <span className="absolute bottom-1 left-1 bg-black/60 px-1.5 py-0.5 rounded text-[9px] font-mono text-white">
                        #{idx + 1}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* E. PUNTOS CLAVE / BENEFICIOS DESTACADOS (HIGHLIGHTS) */}
            <div className="space-y-4 pt-4 border-t border-white/10">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-white flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>E. Puntos Clave & Beneficios Destacados ({highlights.length})</span>
                </label>
                <span className="text-[10px] text-slate-400">Viñetas de alta conversión mostradas en tarjetas especiales</span>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={newHighlight}
                  onChange={(e) => setNewHighlight(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      if (newHighlight.trim()) {
                        setHighlights([...highlights, newHighlight.trim()]);
                        setNewHighlight("");
                      }
                    }
                  }}
                  placeholder="Ej: Stock inmediato en depósito • Envío express con número de seguimiento..."
                  className="input-falcon text-xs flex-1"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (newHighlight.trim()) {
                      setHighlights([...highlights, newHighlight.trim()]);
                      setNewHighlight("");
                    }
                  }}
                  className="btn-falcon-primary text-xs py-2 px-4 flex items-center gap-1.5 shrink-0 font-bold"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Agregar</span>
                </button>
              </div>

              {highlights.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {highlights.map((hl, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-900/80 border border-white/10 rounded-xl p-2.5 flex items-center justify-between gap-2 text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span className="text-slate-200">{hl}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setHighlights(highlights.filter((_, i) => i !== idx))}
                        className="text-slate-500 hover:text-rose-400 p-1"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* F. PREGUNTAS FRECUENTES (FAQS) PERSONALIZADAS */}
            <div className="space-y-4 pt-4 border-t border-white/10">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-white flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-cyan-400" />
                  <span>F. Preguntas Frecuentes (FAQs) de este Producto ({customFaqs.length})</span>
                </label>
                <span className="text-[10px] text-slate-400">Responde objeciones comunes de tus compradores</span>
              </div>

              <div className="bg-slate-900/60 p-3.5 sm:p-4 rounded-2xl border border-white/5 space-y-3">
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-300 font-semibold block">Pregunta:</label>
                  <input
                    type="text"
                    value={newFaqQ}
                    onChange={(e) => setNewFaqQ(e.target.value)}
                    placeholder="Ej: ¿Cómo funciona el envío o cuándo recibo el acceso?"
                    className="input-falcon text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-300 font-semibold block">Respuesta:</label>
                  <textarea
                    rows={2}
                    value={newFaqA}
                    onChange={(e) => setNewFaqA(e.target.value)}
                    placeholder="Ej: El despacho se realiza en 24hs hábiles o recibes el acceso inmediato en tu email..."
                    className="input-falcon text-xs"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (newFaqQ.trim() && newFaqA.trim()) {
                      setCustomFaqs([...customFaqs, { q: newFaqQ.trim(), a: newFaqA.trim() }]);
                      setNewFaqQ("");
                      setNewFaqA("");
                    }
                  }}
                  className="btn-falcon-primary text-xs py-2 px-4 flex items-center gap-1.5 font-bold"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Añadir Pregunta Frecuente</span>
                </button>
              </div>

              {customFaqs.length > 0 && (
                <div className="space-y-2">
                  {customFaqs.map((faq, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-900/90 border border-white/10 rounded-2xl p-3.5 space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <strong className="text-xs text-white font-heading">
                          ❓ {faq.q}
                        </strong>
                        <button
                          type="button"
                          onClick={() => setCustomFaqs(customFaqs.filter((_, i) => i !== idx))}
                          className="text-slate-500 hover:text-rose-400 p-1"
                          title="Eliminar FAQ"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed pl-5">
                        {faq.a}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* G. PORTADA PRINCIPAL & VIDEO DEMO */}
            <div className="space-y-4 pt-4 border-t border-white/10">
              <label className="text-xs font-bold text-white flex items-center gap-2">
                <Video className="w-4 h-4 text-rose-400" />
                <span>G. Portada Principal & Video Demostrativo</span>
              </label>

              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-300 block">
                    URL de Imagen de Portada Principal
                  </label>
                  <input
                    type="url"
                    value={coverImageUrl}
                    onChange={(e) => setCoverImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="input-falcon text-xs"
                  />
                </div>

                {/* Presets */}
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-300 block">
                      Video / Demo Audiovisual (YouTube, Vimeo o Loom)
                    </label>
                    <input
                      type="url"
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      placeholder="https://www.youtube.com/watch?v=..."
                      className="input-falcon text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-300 block">
                      Enlace de Previsualización Pública (Demo Externa)
                    </label>
                    <input
                      type="url"
                      value={demoUrl}
                      onChange={(e) => setDemoUrl(e.target.value)}
                      placeholder="https://midemo.com"
                      className="input-falcon text-xs"
                    />
                  </div>
                </div>

                {videoPreview && videoPreview.embedUrl && (
                  <div className="rounded-2xl overflow-hidden aspect-video border border-white/10 max-w-lg mt-2">
                    <iframe
                      src={videoPreview.embedUrl}
                      title="Video Demo Preview"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* H. MODO DE PÁGINA DE VENTA */}
            <div className="space-y-4 pt-4 border-t border-white/10">
              <label className="text-xs font-bold text-white flex items-center gap-2">
                <Store className="w-4 h-4 text-cyan-400" />
                <span>H. Canal de Ventas & Enlaces de Checkout</span>
              </label>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
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
                    Tu tienda personalizada y optimizada con colores, banner, video, checkout directo multidivisa y entrega automática.
                  </p>
                  <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                    <span className="text-[11px] text-cyan-300 font-semibold">
                      {salesPageMode === "falko" ? "✓ Canal Activo" : "Seleccionar"}
                    </span>
                    <a
                      href={`/product/${initialProduct.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                    >
                      <span>Abrir Tienda</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                <div
                  onClick={() => setSalesPageMode("external")}
                  className={`cursor-pointer rounded-2xl p-4 border transition-all ${
                    salesPageMode === "external"
                      ? "bg-purple-950/40 border-purple-500 shadow-glow"
                      : "bg-slate-950/50 border-white/5 hover:border-white/20"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-purple-400" />
                      <strong className="text-sm text-white">Web o Landing Externa</strong>
                    </div>
                    <span className="text-[10px] bg-purple-950 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-full font-bold">
                      Avanzado
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed mb-3">
                    Usa tu propia landing page en WordPress o Webflow e integra el checkout de FALKO con 1 clic.
                  </p>
                  <span className="text-[11px] text-purple-300 font-semibold">
                    {salesPageMode === "external" ? "✓ Canal Activo" : "Seleccionar"}
                  </span>
                </div>
              </div>

              {salesPageMode === "external" && (
                <div className="bg-purple-950/30 border border-purple-500/30 p-4 rounded-2xl space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-white block">
                      URL de tu Landing Page Externa
                    </label>
                    <input
                      type="url"
                      value={salesPageUrl}
                      onChange={(e) => setSalesPageUrl(e.target.value)}
                      placeholder="https://miweb.com/landing"
                      className="input-falcon text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-white block">
                      Enlace de Checkout para tus Botones de Compra:
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        readOnly
                        value={`${typeof window !== "undefined" ? window.location.origin : "https://falko.dpdns.org"}/checkout?product=${initialProduct.slug}`}
                        className="input-falcon text-xs font-mono select-all flex-1"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const origin = typeof window !== "undefined" ? window.location.origin : "https://falko.dpdns.org";
                          navigator.clipboard.writeText(`${origin}/checkout?product=${initialProduct.slug}`);
                          setCopiedCheckoutLink(true);
                          setTimeout(() => setCopiedCheckoutLink(false), 2500);
                        }}
                        className="btn-falcon-primary text-xs py-2 px-3 flex items-center gap-1 font-bold shrink-0"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>{copiedCheckoutLink ? "¡Copiado!" : "Copiar"}</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* 3. BÓVEDA DIGITAL & ENTREGA DEL PRODUCTO                 */}
        {/* ======================================================== */}
        {(activeTab === "ALL" || activeTab === "DELIVERY") && (
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6 animate-in fade-in-50">
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-950 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-lg font-heading font-bold text-white">
                    3. Entrega & Contenido Digital
                  </h2>
                  <p className="text-xs text-slate-400">
                    Solo compradores verificados tendrán acceso a esta bóveda privada
                  </p>
                </div>
              </div>
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
                <span className="text-[11px] text-slate-400">
                  Este enlace se entregará únicamente a los compradores tras verificar el pago con éxito.
                </span>
              </div>

              {/* Secure Vault Files List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Archivos Protegidos en Bóveda ({files.length})</span>
                  </label>
                  <span className="text-[10px] text-slate-400">
                    Enlaces de descarga firmados con caducidad de seguridad
                  </span>
                </div>

                {files.length > 0 && (
                  <div className="space-y-2">
                    {files.map((file, idx) => (
                      <div
                        key={idx}
                        className="bg-slate-900/80 border border-white/10 rounded-2xl p-3 flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-xl bg-cyan-950 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                            <FileCode className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-white truncate">{file.fileName}</p>
                            <p className="text-[10px] text-slate-400">
                              {(file.fileSizeBytes / (1024 * 1024)).toFixed(1)} MB • {file.fileType}
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveFile(idx)}
                          className="text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 p-1.5 rounded-lg transition-colors shrink-0"
                          title="Eliminar archivo"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add New File Box */}
                <div className="bg-slate-950/60 p-3.5 sm:p-4 rounded-2xl border border-white/5 space-y-3">
                  <span className="text-xs font-bold text-slate-200 block">
                    + Adjuntar Nuevo Archivo a la Bóveda:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                    <div className="sm:col-span-8">
                      <input
                        type="text"
                        value={newFileName}
                        onChange={(e) => setNewFileName(e.target.value)}
                        placeholder="Nombre de archivo (ej: Masterclass_Guia_Pro.pdf o Toolkit.zip)"
                        className="input-falcon text-xs w-full"
                      />
                    </div>
                    <div className="sm:col-span-4 flex gap-2">
                      <input
                        type="number"
                        min="1"
                        value={newFileMb}
                        onChange={(e) => setNewFileMb(e.target.value)}
                        placeholder="MB"
                        className="input-falcon text-xs w-20 font-mono"
                        title="Tamaño aproximado en MB"
                      />
                      <button
                        type="button"
                        onClick={handleAddFile}
                        className="btn-falcon-primary text-xs py-2 px-3 flex-1 flex items-center justify-center gap-1 font-bold"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Añadir</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Instructions */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 block">
                  Instrucciones de Bienvenida o Consumo
                </label>
                <textarea
                  rows={3}
                  value={accessInstructions}
                  onChange={(e) => setAccessInstructions(e.target.value)}
                  placeholder="Ej: Te recomendamos descomprimir el ZIP y abrir el PDF de introducción antes de iniciar los módulos..."
                  className="input-falcon w-full text-xs leading-relaxed"
                />
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* 4. PROGRAMA DE AFILIADOS & PÍXELES                      */}
        {/* ======================================================== */}
        {(activeTab === "ALL" || activeTab === "AFFILIATES") && (
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6 animate-in fade-in-50">
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-950 border border-purple-500/30 flex items-center justify-center text-purple-400">
                  <Percent className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-lg font-heading font-bold text-white">
                    4. Programa de Afiliados
                  </h2>
                  <p className="text-xs text-slate-400">
                    Permite a otros creadores promocionar este producto ({productType === "PHYSICAL" ? "físico" : "digital"}) y ganar comisiones automáticas
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={affiliateEnabled}
                    onChange={(e) => setAffiliateEnabled(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>
            </div>

            {affiliateEnabled && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 block">
                    Porcentaje de Comisión para Afiliados (%)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="5"
                      max="90"
                      value={affiliateCommissionPct}
                      onChange={(e) => setAffiliateCommissionPct(e.target.value)}
                      className="input-falcon w-full pr-8 text-sm font-mono font-bold text-purple-300"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">%</span>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    Ganarán aprox. {currencyCode === "USD" ? "$" : currencyCode} {((parseFloat(price) || 0) * (parseFloat(affiliateCommissionPct) || 0) / 100).toFixed(2)} por cada venta generada.
                  </span>
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
                    <option value="AUTO">Automático (Cualquiera puede afiliarse y vender)</option>
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
          </div>
        )}

        {/* ======================================================== */}
        {/* 5. 1-CLICK UPSELL & MARKETING TRACKING PIXELS           */}
        {/* ======================================================== */}
        {(activeTab === "ALL" || activeTab === "UPSELL") && (
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6 animate-in fade-in-50">
            <div className="flex items-center gap-2.5 pb-3 border-b border-white/5">
              <div className="w-8 h-8 rounded-xl bg-amber-950 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-lg font-heading font-bold text-white">
                  5. Oferta 1-Click Upsell Post-Compra & Analítica
                </h2>
                <p className="text-xs text-slate-400">
                  Aumenta el ticket promedio ofreciendo una oferta irresistible con 1 solo clic tras pagar
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2 space-y-1.5">
                <label className="text-xs font-bold text-slate-300 block">
                  Título de la Oferta Upsell
                </label>
                <input
                  type="text"
                  value={upsellTitle}
                  onChange={(e) => setUpsellTitle(e.target.value)}
                  placeholder="Ej: Acceso VIP a Comunidad Exclusiva de Emprendedores"
                  className="input-falcon w-full text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 block">
                  Precio Especial de Upsell ({currencyCode})
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-mono">
                    {currencyCode === "USD" ? "$" : currencyCode}
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    value={upsellPrice}
                    onChange={(e) => setUpsellPrice(e.target.value)}
                    placeholder="19.00"
                    className="input-falcon w-full pl-8 text-sm font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 block">
                  Enlace de Entrega del Upsell (Google Drive, Notion o Archivo)
                </label>
                <input
                  type="url"
                  value={upsellFileUrl}
                  onChange={(e) => setUpsellFileUrl(e.target.value)}
                  placeholder="https://notion.so/mi-recurso-vip..."
                  className="input-falcon w-full text-sm"
                />
              </div>

              <div className="md:col-span-2 space-y-1.5">
                <label className="text-xs font-bold text-slate-300 block">
                  Descripción Corta del Upsell
                </label>
                <textarea
                  rows={2}
                  value={upsellDescription}
                  onChange={(e) => setUpsellDescription(e.target.value)}
                  placeholder="Explica en 2 líneas por qué deben aprovechar esta oferta única ahora mismo..."
                  className="input-falcon w-full text-xs leading-relaxed"
                />
              </div>
            </div>

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
        )}

        {/* Action Buttons Bar */}
        <div className="glass-panel p-5 rounded-3xl border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 sticky bottom-4 z-40 bg-slate-950/90 backdrop-blur-xl shadow-2xl">
          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            className="btn-falcon-secondary w-full sm:w-auto text-xs py-3 px-4 text-rose-400 border-rose-500/30 hover:border-rose-500/70 hover:bg-rose-950/40 flex items-center justify-center gap-2 font-bold"
          >
            <Trash2 className="w-4 h-4 text-rose-400" />
            <span>Eliminar Producto</span>
          </button>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <Link
              href={`/product/${initialProduct.slug}`}
              target="_blank"
              className="btn-falcon-secondary w-full sm:w-auto text-xs py-3 px-5 text-center flex items-center justify-center gap-1.5"
            >
              <Eye className="w-3.5 h-3.5 text-cyan-400" />
              <span>Ver Tienda</span>
            </Link>

            <button
              type="submit"
              disabled={isSaving}
              className="btn-falcon-primary w-full sm:w-auto text-xs py-3 px-8 shadow-glow flex items-center justify-center gap-2 font-bold text-sm"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? "Guardando Cambios..." : "Guardar Cambios de Tienda"}</span>
            </button>
          </div>
        </div>
      </form>

      {/* Modal de confirmación para eliminar producto */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-rose-500/40 rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2 text-rose-400">
                <Trash2 className="w-5 h-5" />
                <h3 className="font-heading font-bold text-white text-base">
                  ¿Eliminar este producto?
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-rose-950/30 border border-rose-500/30 rounded-2xl p-4 text-xs text-rose-200 space-y-2">
              <p className="font-bold text-white text-sm">
                {initialProduct.title}
              </p>
              <p className="text-slate-300">
                Esta acción es <strong>irreversible</strong>. Se eliminará el producto de tu catálogo, de la tienda pública y del marketplace.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className="btn-falcon-secondary text-xs py-2.5 px-4"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDeleteProduct}
                disabled={isDeleting}
                className="bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs py-2.5 px-5 rounded-xl shadow-lg flex items-center gap-2 transition-all disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                <span>{isDeleting ? "Eliminando..." : "Sí, Eliminar Definitivamente"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
