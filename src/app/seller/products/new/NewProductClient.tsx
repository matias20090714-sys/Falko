"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { CURRENCY_RATES, computeFinancialSplit, formatCurrency } from "@/lib/currency";
import { getVideoEmbedUrl } from "@/lib/media";
import { processAndCompressImage } from "@/lib/image-upload";
import {
  Activity,
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  Code,
  DollarSign,
  ExternalLink,
  Eye,
  FileCode,
  FileText,
  Film,
  FolderOpen,
  Globe,
  GraduationCap,
  HelpCircle,
  Image as ImageIcon,
  Info,
  Layers,
  Link as LinkIcon,
  Lock,
  MessageSquare,
  Package,
  Percent,
  Play,
  Plus,
  Rocket,
  ShieldCheck,
  Sparkles,
  Store,
  Tag,
  Target,
  Trash2,
  Truck,
  Upload,
  Video,
  Wand2,
  X,
  Zap,
} from "lucide-react";

interface UploadedFileItem {
  id: string;
  fileName: string;
  fileSizeBytes: number;
  fileType: string;
  storageKey: string;
  url?: string;
}

interface CouponItem {
  id: string;
  code: string;
  discountPct: number;
}

interface LessonItem {
  id: string;
  title: string;
  videoUrl: string;
  durationMin: number;
}

interface ModuleItem {
  id: string;
  title: string;
  lessons: LessonItem[];
}

interface NewProductClientProps {
  categories: any[];
  currentUser: any;
}

// Preset Quick Cover Gallery
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
    category: "Marketing & Ventas",
    title: "High-Ticket Funnel",
    url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80",
  },
  {
    category: "Diseño & Creativos",
    title: "Creative Studio",
    url: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&auto=format&fit=crop&q=80",
  },
];

// Quick Templates for 1-Click Setup
const PRODUCT_TEMPLATES = [
  {
    id: "ebook",
    icon: BookOpen,
    title: "Ebook / Guía PDF",
    badge: "Ideal Principiantes",
    desc: "Guías prácticas, plantillas de lectura, manuales y recetarios.",
    preset: {
      title: "",
      price: "19.00",
      categorySlug: "negocios-finanzas",
      coverUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80",
      description: "",
    },
  },
  {
    id: "course",
    icon: GraduationCap,
    title: "Curso Online en Video",
    badge: "Más Vendido",
    desc: "Clases grabadas, módulos estructurados y material descargable.",
    preset: {
      title: "",
      price: "67.00",
      categorySlug: "inteligencia-artificial",
      coverUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80",
      description: "",
      videoUrl: "",
    },
  },
  {
    id: "prompts",
    icon: Sparkles,
    title: "Pack de Prompts & IA",
    badge: "Alta Conversión",
    desc: "Comandos para ChatGPT, Claude, Midjourney y plantillas Notion.",
    preset: {
      title: "",
      price: "27.00",
      categorySlug: "inteligencia-artificial",
      coverUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80",
      description: "",
    },
  },
  {
    id: "software",
    icon: Code,
    title: "Software / Código / SaaS",
    badge: "Productor Tech",
    desc: "Boilerplates, código fuente, scripts, plugins o aplicaciones.",
    preset: {
      title: "",
      price: "97.00",
      categorySlug: "desarrollo-software",
      coverUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80",
      description: "",
      demoUrl: "",
    },
  },
  {
    id: "community",
    icon: MessageSquare,
    title: "Comunidad / Mentoría",
    badge: "Exclusivo",
    desc: "Acceso a grupo privado de Telegram/Discord o llamadas mensuales.",
    preset: {
      title: "",
      price: "49.00",
      categorySlug: "negocios-finanzas",
      coverUrl: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800&auto=format&fit=crop&q=80",
      description: "",
      accessUrl: "",
      accessInstructions: "",
      productType: "DIGITAL" as const,
      stock: "0",
      shippingFee: "0",
      estimatedDeliveryDays: "",
    },
  },
  {
    id: "physical-merch",
    icon: Package,
    title: "Producto Físico / Merch / Indumentaria",
    badge: "📦 Envío a Domicilio",
    desc: "Ropa, zapatillas, accesorios o merchandising con control de stock y despacho.",
    preset: {
      title: "",
      price: "39.00",
      categorySlug: "negocios-finanzas",
      coverUrl: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80",
      description: "",
      productType: "PHYSICAL" as const,
      stock: "50",
      shippingFee: "0",
      estimatedDeliveryDays: "24 a 48 hs hábiles",
    },
  },
  {
    id: "physical-hardware",
    icon: Truck,
    title: "Hardware / Electrónica / Gadgets",
    badge: "📦 Físico Tech",
    desc: "Dispositivos, herramientas físicas, periféricos o artículos tecnológicos.",
    preset: {
      title: "",
      price: "79.00",
      categorySlug: "desarrollo-software",
      coverUrl: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&auto=format&fit=crop&q=80",
      description: "",
      productType: "PHYSICAL" as const,
      stock: "25",
      shippingFee: "9.00",
      estimatedDeliveryDays: "2 a 4 días hábiles",
    },
  },
];

export function NewProductClient({ categories, currentUser }: NewProductClientProps) {
  const router = useRouter();

  // Mode: "express" (3-step beginner friendly) | "pro" (full advanced studio)
  const [creationMode, setCreationMode] = useState<"express" | "pro">("express");

  // Express Wizard Step: 1 = Template/Tipo, 2 = Info Básica & Portada, 3 = Entrega & Precio
  const [wizardStep, setWizardStep] = useState(1);

  // Form Data
  const [formData, setFormData] = useState({
    title: "",
    shortDescription: "",
    description: "",
    productType: "DIGITAL" as "DIGITAL" | "PHYSICAL",
    stock: "50",
    shippingFee: "0",
    estimatedDeliveryDays: "24 a 48 hs hábiles",
    price: "37.00",
    compareAtPrice: "",
    pricingType: "ONE_TIME",
    billingInterval: "MONTHLY",
    trialDays: 0,
    currencyCode: "USD",
    categoryId: categories[0]?.id || "",
    guaranteeDays: 7,
    inMarketplace: true,
    storeTheme: "dark",
    primaryColor: "#06b6d4",
    secondaryColor: "#3b82f6",
    backgroundColor: "#030712",
    bannerImageUrl: "",
    customBadgeText: "",
    ctaButtonText: "",
    ctaSubtext: "",
    affiliateEnabled: true,
    affiliateCommissionPct: 30,
    affiliateApprovalMode: "AUTO",
    coverImageUrl: COVER_PRESETS[0].url,
    demoUrl: "",
    salesPageUrl: "",
    videoUrl: "",
    accessUrl: "",
    accessInstructions: "",
    // Order Bump
    orderBumpTitle: "",
    orderBumpPrice: "9.99",
    orderBumpDescription: "",
    // 1-Click Post-Purchase Upsell
    upsellTitle: "",
    upsellPrice: "",
    upsellDescription: "",
    upsellFileUrl: "",
    // Tracking Pixels
    metaPixelId: "",
    googleAnalyticsId: "",
    tiktokPixelId: "",
    // Affiliate Swipe
    affiliateSwipeUrl: "",
  });

  // Highlights / Features list
  const [highlights, setHighlights] = useState<string[]>([]);
  const [newHighlight, setNewHighlight] = useState("");

  // Custom FAQs list
  const [customFaqs, setCustomFaqs] = useState<{ q: string; a: string }[]>([]);
  const [newFaqQ, setNewFaqQ] = useState("");
  const [newFaqA, setNewFaqA] = useState("");

  // Digital Files (Default empty so only seller's real files exist)
  const [digitalFiles, setDigitalFiles] = useState<UploadedFileItem[]>([]);

  // Gallery
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [customImageUrl, setCustomImageUrl] = useState("");

  // Coupons
  const [coupons, setCoupons] = useState<CouponItem[]>([
    { id: "c-1", code: "LANZAMIENTO20", discountPct: 20 },
  ]);
  const [newCouponCode, setNewCouponCode] = useState("");
  const [newCouponPct, setNewCouponPct] = useState(15);

  // Modules & Lessons
  const [modules, setModules] = useState<ModuleItem[]>([]);

  // Upload States
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const coverInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

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

  const applyTemplate = (template: (typeof PRODUCT_TEMPLATES)[0]) => {
    const matchedCategory = categories.find((c) => c.slug === template.preset.categorySlug) || categories[0];
    setFormData((prev) => ({
      ...prev,
      title: prev.title || "",
      shortDescription: "",
      description: prev.description || "",
      productType: (template.preset as any).productType || "DIGITAL",
      stock: (template.preset as any).stock || prev.stock,
      shippingFee: (template.preset as any).shippingFee || prev.shippingFee,
      estimatedDeliveryDays: (template.preset as any).estimatedDeliveryDays || prev.estimatedDeliveryDays,
      categoryId: matchedCategory?.id || prev.categoryId,
      coverImageUrl: template.preset.coverUrl || prev.coverImageUrl,
      price: prev.price || template.preset.price,
    }));

    if (template.id === "course" && modules.length === 0) {
      setModules([
        {
          id: "mod-1",
          title: "Módulo 1: Introducción y Bienvenida",
          lessons: [
            { id: "les-1", title: "1. Lección Inicial", videoUrl: "", durationMin: 10 },
          ],
        },
      ]);
    }

    setWizardStep(2);
  };

  const uploadFileToServer = async (file: File, category: "image" | "video" | "file") => {
    const form = new FormData();
    form.append("file", file);
    form.append("category", category);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: form,
    });

    const data = await res.json();
    if (!data.success) {
      throw new Error(data.error || "Error al subir el archivo");
    }
    return data.file;
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingCover(true);
    try {
      const res = await processAndCompressImage(file, 1600, 0.88);
      setFormData((prev) => ({ ...prev, coverImageUrl: res.url }));
    } catch (err: any) {
      alert(err.message || "Error al procesar la imagen de portada.");
    } finally {
      setUploadingCover(false);
      if (e.target) e.target.value = "";
    }
  };

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingBanner(true);
    try {
      const res = await processAndCompressImage(file, 1920, 0.85);
      setFormData((prev) => ({ ...prev, bannerImageUrl: res.url }));
    } catch (err: any) {
      alert(err.message || "Error al procesar el banner.");
    } finally {
      setUploadingBanner(false);
      if (e.target) e.target.value = "";
    }
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    setUploadingGallery(true);
    try {
      const uploadedUrls: string[] = [];
      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];
        const res = await processAndCompressImage(file, 1400, 0.85);
        uploadedUrls.push(res.url);
      }
      setGalleryImages((prev) => [...prev, ...uploadedUrls]);
    } catch (err: any) {
      alert(err.message || "Error al procesar las fotos de la galería.");
    } finally {
      setUploadingGallery(false);
      if (e.target) e.target.value = "";
    }
  };

  const handleDeliverableFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingFile(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        try {
          const uploaded = await uploadFileToServer(file, "file");
          setDigitalFiles((prev) => [
            ...prev,
            {
              id: `file-${Date.now()}-${i}`,
              fileName: uploaded.fileName || file.name,
              fileSizeBytes: uploaded.fileSizeBytes || file.size,
              fileType: uploaded.fileType || file.type,
              storageKey: uploaded.storageKey || `vault/${file.name}`,
              url: uploaded.url,
            },
          ]);
        } catch {
          setDigitalFiles((prev) => [
            ...prev,
            {
              id: `file-${Date.now()}-${i}`,
              fileName: file.name,
              fileSizeBytes: file.size,
              fileType: file.type || "application/octet-stream",
              storageKey: `vault/${file.name}`,
            },
          ]);
        }
      }
    } finally {
      setUploadingFile(false);
    }
  };

  const handleRemoveFile = (id: string) => {
    setDigitalFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.title.trim()) {
      setError("Por favor ingresa un título para el producto.");
      return;
    }

    if (numPrice <= 0) {
      setError("El precio debe ser mayor a 0.");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        title: formData.title,
        shortDescription: formData.shortDescription,
        description: formData.description || formData.shortDescription,
        productType: formData.productType,
        stock: formData.productType === "PHYSICAL" ? (parseInt(formData.stock.toString()) || 0) : null,
        shippingFee: formData.productType === "PHYSICAL" ? (parseFloat(formData.shippingFee.toString()) || 0) : null,
        estimatedDeliveryDays: formData.productType === "PHYSICAL" ? (formData.estimatedDeliveryDays.trim() || "24 a 48 hs hábiles") : null,
        requiresShipping: formData.productType === "PHYSICAL",
        price: numPrice,
        compareAtPrice: formData.compareAtPrice ? parseFloat(formData.compareAtPrice) : null,
        pricingType: formData.pricingType || "ONE_TIME",
        billingInterval: formData.pricingType === "SUBSCRIPTION" ? (formData.billingInterval || "MONTHLY") : "MONTHLY",
        trialDays: parseInt(formData.trialDays?.toString() || "0") || 0,
        currencyCode: formData.currencyCode,
        categoryId: formData.categoryId,
        guaranteeDays: !isNaN(parseInt(formData.guaranteeDays.toString())) ? parseInt(formData.guaranteeDays.toString()) : 0,
        inMarketplace: formData.inMarketplace !== undefined ? Boolean(formData.inMarketplace) : true,
        storeTheme: formData.storeTheme || "dark",
        primaryColor: formData.primaryColor || "#06b6d4",
        secondaryColor: formData.secondaryColor || "#3b82f6",
        backgroundColor: formData.backgroundColor || "#030712",
        bannerImageUrl: formData.bannerImageUrl.trim() || null,
        customBadgeText: formData.customBadgeText.trim() || null,
        ctaButtonText: formData.ctaButtonText.trim() || null,
        ctaSubtext: formData.ctaSubtext.trim() || null,
        customHighlights: highlights.length > 0 ? JSON.stringify(highlights) : null,
        customFaqsJson: customFaqs.length > 0 ? JSON.stringify(customFaqs) : null,
        upsellTitle: formData.upsellTitle.trim() || null,
        upsellDescription: formData.upsellDescription.trim() || null,
        upsellPrice: formData.upsellPrice ? parseFloat(formData.upsellPrice) : null,
        upsellFileUrl: formData.upsellFileUrl.trim() || null,
        affiliateEnabled: formData.affiliateEnabled,
        affiliateCommissionPct: parseFloat(formData.affiliateCommissionPct.toString()) || 20,
        affiliateApprovalMode: formData.affiliateApprovalMode,
        coverImageUrl: formData.coverImageUrl,
        demoUrl: formData.demoUrl || null,
        videoUrl: formData.videoUrl || null,
        accessUrl: formData.accessUrl || null,
        accessInstructions: formData.accessInstructions || null,
        orderBumpTitle: formData.orderBumpTitle || null,
        orderBumpPrice: formData.orderBumpTitle ? parseFloat(formData.orderBumpPrice) || 9.99 : null,
        orderBumpDescription: formData.orderBumpDescription || null,
        metaPixelId: formData.metaPixelId || null,
        googleAnalyticsId: formData.googleAnalyticsId || null,
        tiktokPixelId: formData.tiktokPixelId || null,
        affiliateSwipeUrl: formData.affiliateSwipeUrl || null,
        digitalFiles: digitalFiles.map((f) => ({
          fileName: f.fileName,
          fileSizeBytes: f.fileSizeBytes,
          fileType: f.fileType,
          storageKey: f.storageKey,
        })),
        galleryImages,
        coupons,
        modules,
      };

      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.success && data.product) {
        router.push(`/product/${data.product.slug}`);
      } else {
        setError(data.error || "Error al publicar el producto.");
      }
    } catch (err: any) {
      setError(err.message || "Error de red al crear el producto.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header & Mode Switcher */}
      <div className="glass-panel p-6 rounded-3xl border border-white/10 bg-gradient-to-r from-slate-950 via-cyan-950/20 to-slate-950">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs uppercase font-bold text-cyan-400 tracking-wider">
                Publicador de Productos FALKO
              </span>
              <span className="text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-800 px-2 py-0.5 rounded-full font-mono">
                {creationMode === "express" ? "⚡ MODO ASISTENTE RÁPIDO" : "💎 MODO PRO STUDIO"}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-heading font-black text-white">
              Sube y Vende tu Producto Digital
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Crea tu página de venta con pasarela internacional, pagos cripto y cobro automático en minutos.
            </p>
          </div>

          {/* Mode Switch Tabs */}
          <div className="flex items-center bg-slate-900/90 p-1.5 rounded-2xl border border-white/10 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setCreationMode("express")}
              className={`flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
                creationMode === "express"
                  ? "bg-cyan-950 text-cyan-300 border-2 border-cyan-400 shadow-glow font-black"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              <span>Modo Fácil (3 Pasos)</span>
            </button>
            <button
              type="button"
              onClick={() => setCreationMode("pro")}
              className={`flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
                creationMode === "pro"
                  ? "bg-cyan-950 text-cyan-300 border-2 border-cyan-400 shadow-glow font-black"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              <span>Modo Avanzado (Pro)</span>
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs p-4 rounded-2xl flex items-center gap-2">
          <Info className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 🚀 MODO 1: ASISTENTE RÁPIDO EN 3 PASOS PARA PRINCIPIANTES */}
      {/* ========================================================================= */}
      {creationMode === "express" && (
        <div className="space-y-6">
          {/* Wizard Step Progress Indicator */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4">
            <button
              type="button"
              onClick={() => setWizardStep(1)}
              className={`p-3 sm:p-4 rounded-2xl border text-left transition-all ${
                wizardStep === 1
                  ? "bg-cyan-950/60 border-cyan-500 text-cyan-300 shadow-glow"
                  : wizardStep > 1
                  ? "bg-slate-900/60 border-emerald-500/40 text-emerald-300"
                  : "bg-slate-950/40 border-white/5 text-slate-500"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] uppercase font-mono font-bold">Paso 1</span>
                {wizardStep > 1 && <Check className="w-3.5 h-3.5 text-emerald-400" />}
              </div>
              <span className="text-xs sm:text-sm font-bold block truncate">Tipo de Producto</span>
            </button>

            <button
              type="button"
              onClick={() => setWizardStep(2)}
              className={`p-3 sm:p-4 rounded-2xl border text-left transition-all ${
                wizardStep === 2
                  ? "bg-cyan-950/60 border-cyan-500 text-cyan-300 shadow-glow"
                  : wizardStep > 2
                  ? "bg-slate-900/60 border-emerald-500/40 text-emerald-300"
                  : "bg-slate-950/40 border-white/5 text-slate-500"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] uppercase font-mono font-bold">Paso 2</span>
                {wizardStep > 2 && <Check className="w-3.5 h-3.5 text-emerald-400" />}
              </div>
              <span className="text-xs sm:text-sm font-bold block truncate">Título & Portada</span>
            </button>

            <button
              type="button"
              onClick={() => setWizardStep(3)}
              className={`p-3 sm:p-4 rounded-2xl border text-left transition-all ${
                wizardStep === 3
                  ? "bg-cyan-950/60 border-cyan-500 text-cyan-300 shadow-glow"
                  : "bg-slate-950/40 border-white/5 text-slate-500"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] uppercase font-mono font-bold">Paso 3</span>
              </div>
              <span className="text-xs sm:text-sm font-bold block truncate">Precio & Entrega</span>
            </button>
          </div>

          {/* STEP 1: SELECT PRODUCT TEMPLATE */}
          {wizardStep === 1 && (
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6 animate-in fade-in duration-200">
              <div className="text-center max-w-xl mx-auto space-y-1">
                <span className="text-xs uppercase font-bold text-cyan-400 font-mono">Paso 1 de 3</span>
                <h2 className="text-xl sm:text-2xl font-bold text-white">¿Qué tipo de producto deseas vender?</h2>
                <p className="text-xs text-slate-400">
                  Selecciona una plantilla para rellenar automáticamente la estructura y optimizar tu página de venta.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {PRODUCT_TEMPLATES.map((tmpl) => {
                  const Icon = tmpl.icon;
                  return (
                    <button
                      key={tmpl.id}
                      type="button"
                      onClick={() => applyTemplate(tmpl)}
                      className="glass-panel p-5 rounded-2xl border border-white/5 hover:border-cyan-500/50 bg-slate-900/40 hover:bg-slate-900/80 text-left transition-all group flex flex-col justify-between hover:scale-[1.02] shadow-sm hover:shadow-cyan-500/10"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <div className="w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:bg-cyan-500 group-hover:text-slate-950 transition-colors">
                            <Icon className="w-5 h-5" />
                          </div>
                          <span className="text-[10px] font-mono bg-cyan-950/80 text-cyan-300 border border-cyan-800/40 px-2 py-0.5 rounded-md">
                            {tmpl.badge}
                          </span>
                        </div>
                        <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                          {tmpl.title}
                        </h3>
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                          {tmpl.desc}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-cyan-400 font-semibold">
                        <span>Elegir Plantilla</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setWizardStep(2)}
                  className="text-xs text-slate-400 hover:text-white underline"
                >
                  O empezar desde cero sin plantilla &rarr;
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: TITLE, DESCRIPTION & COVER IMAGE */}
          {wizardStep === 2 && (
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6 animate-in fade-in duration-200">
              <div className="flex items-center justify-between pb-4 border-b border-white/5">
                <div>
                  <span className="text-xs uppercase font-bold text-cyan-400 font-mono">Paso 2 de 3</span>
                  <h2 className="text-lg sm:text-xl font-bold text-white">Título, Descripción y Portada Visual</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setWizardStep(1)}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  &larr; Cambiar tipo
                </button>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Título del Producto *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Escribe el nombre o título de tu producto..."
                    className="input-falcon text-sm w-full py-2.5"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Biografía / Descripción del Producto *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Escribe la biografía o descripción de tu producto (puede ser corta o detallada)..."
                    className="input-falcon text-xs w-full py-2.5 resize-y"
                    required
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Esta biografía y descripción se mostrará a tus compradores en tu tienda y catálogo.
                  </p>
                </div>

                {/* SELECTOR DIGITAL VS FÍSICO */}
                <div className="bg-slate-950/70 p-4 sm:p-5 rounded-2xl border border-white/10 space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-white mb-0.5">
                      Formato del Producto *
                    </label>
                    <span className="text-[11px] text-slate-400">
                      Elige si vendes un recurso digital entregable de inmediato o un artículo físico que requiere envío.
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, productType: "DIGITAL" }))}
                      className={`p-4 rounded-2xl border text-left transition-all relative cursor-pointer ${
                        formData.productType === "DIGITAL"
                          ? "bg-cyan-950/80 border-cyan-400 text-white shadow-glow ring-2 ring-cyan-500/30 font-bold"
                          : "bg-slate-900/60 border-white/5 text-slate-400 hover:text-white"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-bold flex items-center gap-2 text-cyan-300">
                          <Zap className="w-4 h-4 text-cyan-400" />
                          ⚡ Producto Digital
                        </span>
                        {formData.productType === "DIGITAL" && (
                          <span className="w-4 h-4 rounded-full bg-cyan-400 text-slate-950 font-black text-[10px] flex items-center justify-center">
                            ✓
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 font-normal leading-relaxed">
                        Cursos, Software, Ebooks, Prompts IA o enlaces privados. Entrega automática e inmediata.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, productType: "PHYSICAL" }))}
                      className={`p-4 rounded-2xl border text-left transition-all relative cursor-pointer ${
                        formData.productType === "PHYSICAL"
                          ? "bg-cyan-950/80 border-cyan-400 text-white shadow-glow ring-2 ring-cyan-500/30 font-bold"
                          : "bg-slate-900/60 border-white/5 text-slate-400 hover:text-white"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-bold flex items-center gap-2 text-cyan-300">
                          <Package className="w-4 h-4 text-cyan-400" />
                          📦 Producto Físico
                        </span>
                        {formData.productType === "PHYSICAL" && (
                          <span className="w-4 h-4 rounded-full bg-cyan-400 text-slate-950 font-black text-[10px] flex items-center justify-center">
                            ✓
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 font-normal leading-relaxed">
                        Indumentaria, merch, hardware, libros impresos con control de stock y captura de dirección de envío.
                      </p>
                    </button>
                  </div>

                  {/* Physical Extra Settings */}
                  {formData.productType === "PHYSICAL" && (
                    <div className="pt-3 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-3 animate-in fade-in duration-150">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          Stock Disponible (Unidades) *
                        </label>
                        <input
                          type="number"
                          name="stock"
                          min="0"
                          value={formData.stock}
                          onChange={handleChange}
                          placeholder="50"
                          required
                          className="input-falcon text-xs w-full py-2 font-mono"
                        />
                        <span className="text-[10px] text-slate-500">Se descuenta con cada venta</span>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          Costo de Envío (USD)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          name="shippingFee"
                          value={formData.shippingFee}
                          onChange={handleChange}
                          placeholder="0.00"
                          className="input-falcon text-xs w-full py-2 font-mono"
                        />
                        <span className="text-[10px] text-emerald-400 font-medium">Pon 0 para Envío Gratis</span>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          Tiempo Estimado de Entrega
                        </label>
                        <input
                          type="text"
                          name="estimatedDeliveryDays"
                          value={formData.estimatedDeliveryDays}
                          onChange={handleChange}
                          placeholder="24 a 48 hs hábiles"
                          className="input-falcon text-xs w-full py-2"
                        />
                        <span className="text-[10px] text-slate-500">ej. 24 a 48 hs hábiles</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Categoría en Marketplace
                    </label>
                    <select
                      name="categoryId"
                      value={formData.categoryId}
                      onChange={handleChange}
                      className="input-falcon text-xs w-full py-2.5"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                    <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Garantía Protegida FALKO
                    </label>
                    <select
                      name="guaranteeDays"
                      value={formData.guaranteeDays}
                      onChange={handleChange}
                      className="input-falcon text-xs w-full py-2.5"
                    >
                      <option value={0}>Sin garantía (0 días - Pago Inmediato / Sin retención)</option>
                      <option value={7}>7 días de garantía incondicional</option>
                      <option value={14}>14 días de garantía</option>
                      <option value={30}>30 días de garantía (Recomendada)</option>
                    </select>
                  </div>
                </div>

                {/* Visibilidad & Distribución del Producto */}
                <div className="bg-slate-950/80 p-4 rounded-2xl border border-white/5 space-y-3">
                  <label className="block text-xs font-bold text-white flex items-center gap-1.5">
                    <Globe className="w-4 h-4 text-cyan-400" />
                    <span>Visibilidad del Producto:</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, inMarketplace: true }))}
                      className={`p-3 rounded-xl border text-left transition-all flex items-start gap-3 ${
                        formData.inMarketplace
                          ? "bg-cyan-950/60 border-cyan-400 text-white shadow-glow"
                          : "bg-slate-900/60 border-white/5 text-slate-400 hover:text-white"
                      }`}
                    >
                      <div className={`p-2 rounded-lg ${formData.inMarketplace ? "bg-cyan-500/20 text-cyan-400" : "bg-white/5 text-slate-400"}`}>
                        <Store className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold flex items-center gap-1.5">
                          <span>🌐 Público en Marketplace</span>
                          {formData.inMarketplace && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5 leading-tight">
                          Aparece en el catálogo general, buscador, categorías y marketplace de FALKO.
                        </p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, inMarketplace: false }))}
                      className={`p-3 rounded-xl border text-left transition-all flex items-start gap-3 ${
                        !formData.inMarketplace
                          ? "bg-cyan-950/60 border-cyan-400 text-white shadow-glow"
                          : "bg-slate-900/60 border-white/5 text-slate-400 hover:text-white"
                      }`}
                    >
                      <div className={`p-2 rounded-lg ${!formData.inMarketplace ? "bg-cyan-500/20 text-cyan-400" : "bg-white/5 text-slate-400"}`}>
                        <LinkIcon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold flex items-center gap-1.5">
                          <span>🔗 Oculto (Solo Link Directo)</span>
                          {!formData.inMarketplace && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5 leading-tight">
                          Oculto del marketplace y catálogo. Solo accesible mediante tu link directo.
                        </p>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Cover Image Selector & Live Card Simulator */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
                  <div className="lg:col-span-2 space-y-3">
                    <label className="block text-xs font-semibold text-slate-300">
                      Portada del Producto (Imagen Principal)
                    </label>

                    <div className="flex flex-col sm:flex-row items-center gap-5 bg-slate-950/60 p-4 rounded-2xl border border-white/5">
                      {/* Live Thumbnail */}
                      <div className="w-36 h-24 rounded-xl bg-slate-900 overflow-hidden border border-white/10 shrink-0 relative group">
                        <img
                          src={formData.coverImageUrl}
                          alt="Portada"
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="flex-1 space-y-2 w-full">
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => coverInputRef.current?.click()}
                            disabled={uploadingCover}
                            className="btn-falcon-secondary text-xs py-1.5 px-3 flex items-center gap-1.5"
                          >
                            <Upload className="w-3.5 h-3.5 text-cyan-400" />
                            <span>{uploadingCover ? "Subiendo..." : "Subir mi propia imagen"}</span>
                          </button>
                          <input
                            ref={coverInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleCoverUpload}
                            className="hidden"
                          />
                        </div>

                        <span className="text-[11px] text-slate-400 block">
                          O elige una de nuestras portadas prediseñadas en alta resolución:
                        </span>
                        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                          {COVER_PRESETS.map((preset, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => setFormData((prev) => ({ ...prev, coverImageUrl: preset.url }))}
                              className={`h-12 rounded-lg overflow-hidden border transition-all ${
                                formData.coverImageUrl === preset.url
                                  ? "border-cyan-400 ring-2 ring-cyan-500/50 scale-105"
                                  : "border-white/10 opacity-70 hover:opacity-100"
                              }`}
                              title={preset.title}
                            >
                              <img src={preset.url} alt={preset.title} className="w-full h-full object-cover" />
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Live Marketplace Card Simulator */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-wider block">
                      👁️ Vista Previa {formData.inMarketplace ? "en Marketplace" : "(Modo Oculto)"}:
                    </span>
                    <div className="glass-panel p-3.5 rounded-2xl border border-cyan-500/30 bg-[#05070e] space-y-2.5 shadow-lg max-w-[280px] mx-auto">
                      <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-900 border border-white/10">
                        <img
                          src={formData.coverImageUrl}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute top-2 left-2 text-[9px] font-bold bg-slate-950/80 text-cyan-300 px-2 py-0.5 rounded border border-white/10">
                          {categories.find((c) => c.id === formData.categoryId)?.name || "Digital"}
                        </span>
                        {formData.affiliateEnabled && (
                          <span className="absolute top-2 right-2 text-[9px] font-bold bg-purple-950/90 text-purple-300 px-1.5 py-0.5 rounded border border-purple-800">
                            {formData.affiliateCommissionPct}% Afiliados
                          </span>
                        )}
                      </div>

                      <h4 className="text-xs font-bold text-white line-clamp-1">
                        {formData.title || "Título del Producto"}
                      </h4>
                      <p className="text-[10px] text-slate-400 line-clamp-2 leading-snug">
                        {formData.description || "Biografía / descripción del producto..."}
                      </p>

                      <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                        <span className="text-xs font-black font-mono text-cyan-400">
                          ${parseFloat(formData.price || "0").toFixed(2)} USD
                        </span>
                        <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-0.5">
                          {Number(formData.guaranteeDays) === 0 ? "⚡ Sin Garantía (Inmediato)" : `🛡️ ${formData.guaranteeDays}d garantía`}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-4 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setWizardStep(1)}
                  className="btn-falcon-secondary text-xs py-2.5 px-4"
                >
                  &larr; Paso Anterior
                </button>
                <button
                  type="button"
                  onClick={() => setWizardStep(3)}
                  className="btn-falcon-primary text-xs py-2.5 px-6 shadow-glow flex items-center gap-1.5 font-bold"
                >
                  <span>Continuar a Precio & Entrega</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: PRICE, DELIVERABLES & PUBLISH */}
          {wizardStep === 3 && (
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6 animate-in fade-in duration-200">
              <div className="flex items-center justify-between pb-4 border-b border-white/5">
                <div>
                  <span className="text-xs uppercase font-bold text-cyan-400 font-mono">Paso 3 de 3</span>
                  <h2 className="text-lg sm:text-xl font-bold text-white">Precio de Venta & Entrega al Comprador</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setWizardStep(2)}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  &larr; Volver a Info
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-5">
                  {/* Price Setting */}
                  <div className="bg-slate-950/60 p-5 rounded-2xl border border-white/5 space-y-3">
                    <label className="block text-xs font-semibold text-slate-300">
                      Precio de Venta (USD) *
                    </label>
                    <div className="flex items-center gap-3">
                      <div className="relative flex-1">
                        <span className="absolute left-3.5 top-3 text-cyan-400 font-bold font-mono">$</span>
                        <input
                          type="number"
                          step="0.01"
                          name="price"
                          value={formData.price}
                          onChange={handleChange}
                          placeholder="49.00"
                          required
                          className="input-falcon text-lg font-black font-mono w-full py-2.5 pl-8 text-white"
                        />
                      </div>
                      <span className="text-xs font-bold text-slate-400 font-mono">USD</span>
                    </div>
                  </div>

                  {/* Delivery Mode Selection: Physical Logistics OR Digital Files/Link */}
                  <div className="space-y-4">
                    <label className="block text-xs font-semibold text-slate-300">
                      {formData.productType === "PHYSICAL"
                        ? "📦 Logística de Entrega y Envío al Comprador"
                        : "⚡ ¿Cómo recibirá el producto tu cliente tras pagar?"}
                    </label>

                    {formData.productType === "PHYSICAL" ? (
                      <div className="bg-gradient-to-br from-cyan-950/40 via-slate-900/60 to-slate-950 p-5 rounded-2xl border border-cyan-500/30 space-y-3.5 shadow-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-500/40 text-cyan-400 flex items-center justify-center shrink-0">
                            <Truck className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="text-xs sm:text-sm font-bold text-white">
                              Captura Automática de Dirección de Envío en Checkout
                            </h4>
                            <span className="text-[11px] text-slate-400">
                              Falko se encarga de solicitar los datos de despacho al comprador durante el pago.
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                          <div className="bg-slate-950/80 p-3 rounded-xl border border-white/5 space-y-1">
                            <span className="text-slate-400 font-bold block text-[10px] uppercase">Stock Disponible:</span>
                            <span className="text-white font-mono font-bold">{formData.stock || "0"} unidades</span>
                          </div>
                          <div className="bg-slate-950/80 p-3 rounded-xl border border-white/5 space-y-1">
                            <span className="text-slate-400 font-bold block text-[10px] uppercase">Costo de Envío:</span>
                            <span className="text-emerald-400 font-mono font-bold">
                              {parseFloat(formData.shippingFee || "0") > 0 ? `$${parseFloat(formData.shippingFee).toFixed(2)} USD` : "¡Envío Gratis!"}
                            </span>
                          </div>
                        </div>

                        <p className="text-[11px] text-slate-300 leading-relaxed border-t border-white/5 pt-3">
                          💡 <strong>¿Cómo funciona?</strong> Cuando un comprador paga tu producto físico, recibirás una notificación con su nombre, calle, ciudad, código postal y teléfono para que despaches el paquete con tu empresa de encomiendas preferida.
                        </p>
                      </div>
                    ) : (
                      <>
                        {/* Option A: Digital Files */}
                        <div className="bg-slate-950/60 p-4 rounded-2xl border border-white/5 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-white flex items-center gap-2">
                              <FolderOpen className="w-4 h-4 text-cyan-400" />
                              Archivos Digitales Descargables (PDF, ZIP, Videos, etc.)
                            </span>
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              disabled={uploadingFile}
                              className="btn-falcon-primary text-[11px] py-1 px-3 shadow-glow flex items-center gap-1"
                            >
                              <Plus className="w-3 h-3" />
                              <span>{uploadingFile ? "Subiendo..." : "Agregar Archivo"}</span>
                            </button>
                            <input
                              ref={fileInputRef}
                              type="file"
                              multiple
                              onChange={handleDeliverableFileUpload}
                              className="hidden"
                            />
                          </div>

                          {digitalFiles.length > 0 ? (
                            <div className="space-y-2">
                              {digitalFiles.map((file) => (
                                <div
                                  key={file.id}
                                  className="bg-slate-900/80 p-3 rounded-xl border border-white/5 flex items-center justify-between text-xs"
                                >
                                  <div className="flex items-center gap-2.5 truncate">
                                    <FileText className="w-4 h-4 text-cyan-400 shrink-0" />
                                    <span className="text-white font-medium truncate">{file.fileName}</span>
                                    <span className="text-[10px] text-slate-500 font-mono shrink-0">
                                      ({(file.fileSizeBytes / (1024 * 1024)).toFixed(1)} MB)
                                    </span>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveFile(file.id)}
                                    className="text-slate-500 hover:text-rose-400 p-1"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-[11px] text-slate-500 italic">No hay archivos cargados aún.</p>
                          )}
                        </div>

                        {/* Option B: Direct Link or Community Access */}
                        <div className="bg-slate-950/60 p-4 rounded-2xl border border-white/5 space-y-3">
                          <span className="text-xs font-bold text-white flex items-center gap-2">
                            <LinkIcon className="w-4 h-4 text-purple-400" />
                            O Enlace Privado de Acceso (Notion, Drive, Canal VIP, Discord)
                          </span>
                          <input
                            type="url"
                            name="accessUrl"
                            value={formData.accessUrl}
                            onChange={handleChange}
                            placeholder="https://t.me/+canal_vip o https://notion.so/mi-plantilla"
                            className="input-falcon text-xs w-full py-2"
                          />
                        </div>
                      </>
                    )}

                    {/* Option C: Sales Page Type & External Web Choice */}
                    <div className="space-y-4 pt-4 border-t border-white/10">
                      <div>
                        <span className="text-sm font-bold text-white flex items-center gap-2 mb-1">
                          <Store className="w-4 h-4 text-cyan-400" />
                          ¿Dónde prefieres presentar y vender este producto?
                        </span>
                        <p className="text-xs text-slate-400">
                          Elige si deseas usar la tienda oficial automática de FALKO o conectar tu propia web externa.
                        </p>
                      </div>

                      {/* 2-Card Mode Choice */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        {/* Option 1: Tienda Oficial FALKO */}
                        <div
                          onClick={() => setFormData({ ...formData, salesPageUrl: "" })}
                          className={`cursor-pointer rounded-2xl p-4 border transition-all ${
                            !formData.salesPageUrl
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
                          <p className="text-xs text-slate-300 leading-relaxed">
                            FALKO genera automáticamente una página de alta conversión para compradores, con video, fotos, FAQs, soporte por WhatsApp y checkout multidivisa.
                          </p>
                          <span className="text-[11px] text-cyan-300 font-semibold block mt-2">
                            {!formData.salesPageUrl ? "✓ Modo Activo (Automático)" : "Seleccionar"}
                          </span>
                        </div>

                        {/* Option 2: Mi Propia Web Externa */}
                        <div
                          onClick={() => {
                            if (!formData.salesPageUrl) {
                              setFormData({ ...formData, salesPageUrl: "https://" });
                            }
                          }}
                          className={`cursor-pointer rounded-2xl p-4 border transition-all ${
                            Boolean(formData.salesPageUrl)
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
                          <p className="text-xs text-slate-300 leading-relaxed">
                            Usa tu propia landing page en WordPress, Webflow, Framer o ClickFunnels y conecta tus botones de compra con el checkout seguro de FALKO.
                          </p>
                          <span className="text-[11px] text-purple-300 font-semibold block mt-2">
                            {Boolean(formData.salesPageUrl) ? "✓ Modo Activo" : "Seleccionar"}
                          </span>
                        </div>
                      </div>

                      {/* Input for external web with test button */}
                      {Boolean(formData.salesPageUrl) && (
                        <div className="bg-slate-950/80 p-4 rounded-2xl border border-purple-500/30 space-y-3 animate-in fade-in-50">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-bold text-white flex items-center gap-1.5">
                              <Globe className="w-3.5 h-3.5 text-purple-400" />
                              <span>URL de tu Página de Ventas Externa</span>
                            </label>
                            {formData.salesPageUrl && formData.salesPageUrl !== "https://" && (
                              <a
                                href={formData.salesPageUrl.startsWith("http") ? formData.salesPageUrl : `https://${formData.salesPageUrl}`}
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
                              name="salesPageUrl"
                              value={formData.salesPageUrl}
                              onChange={handleChange}
                              placeholder="https://tupropiaweb.com/mi-landing"
                              className="input-falcon flex-1 text-xs py-2"
                            />
                            {formData.salesPageUrl && formData.salesPageUrl !== "https://" && (
                              <a
                                href={formData.salesPageUrl.startsWith("http") ? formData.salesPageUrl : `https://${formData.salesPageUrl}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn-falcon-secondary text-xs px-3.5 py-2 flex items-center gap-1.5 shrink-0"
                              >
                                <ExternalLink className="w-3.5 h-3.5 text-purple-400" />
                                <span className="hidden sm:inline">Ver Web</span>
                              </a>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400 leading-relaxed">
                            Al publicar tu producto, obtendrás el enlace directo de checkout para enlazar en los botones de "Comprar" de tu web externa.
                          </p>
                        </div>
                      )}
                    </div>

                    {/* ======================================================== */}
                    {/* AFFILIATE PROGRAM: CLEAR YES/NO & FULL SETTINGS         */}
                    {/* ======================================================== */}
                    <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-purple-500/30 bg-gradient-to-br from-purple-950/20 via-slate-950 to-slate-950 space-y-5 shadow-xl">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Percent className="w-4 h-4 text-purple-400" />
                          <span className="text-[10px] uppercase font-mono font-bold text-purple-400">
                            Fuerza de Ventas Externa
                          </span>
                        </div>
                        <h4 className="text-base font-bold text-white">
                          ¿Deseas que otros afiliados vendan tu producto a cambio de una comisión?
                        </h4>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Tú decides si habilitas el sistema de afiliados y cuánto porcentaje otorgas por cada venta generada.
                        </p>
                      </div>

                      {/* Visual 2-Card Choice: SÍ vs NO */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {/* Option 1: SÍ ACTIVAR AFILIADOS */}
                        <button
                          type="button"
                          onClick={() => setFormData((prev) => ({ ...prev, affiliateEnabled: true }))}
                          className={`p-4 rounded-2xl border text-left transition-all relative cursor-pointer ${
                            formData.affiliateEnabled
                              ? "bg-purple-950/70 border-purple-500 text-white shadow-glow ring-2 ring-purple-500/30"
                              : "bg-slate-950/60 border-white/10 text-slate-400 hover:border-white/20 hover:text-slate-200"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs font-bold flex items-center gap-2 text-purple-300">
                              <Sparkles className="w-4 h-4 text-amber-400" />
                              SÍ, Activar Afiliados
                            </span>
                            {formData.affiliateEnabled && (
                              <span className="w-4 h-4 rounded-full bg-purple-500 flex items-center justify-center text-[10px] text-white">
                                ✓
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400 leading-relaxed">
                            Aparecerá en el catálogo de afiliados para que miles de promotores vendan por ti.
                          </p>
                        </button>

                        {/* Option 2: NO ACTIVAR AFILIADOS */}
                        <button
                          type="button"
                          onClick={() => setFormData((prev) => ({ ...prev, affiliateEnabled: false }))}
                          className={`p-4 rounded-2xl border text-left transition-all relative cursor-pointer ${
                            !formData.affiliateEnabled
                              ? "bg-slate-900 border-cyan-500 text-white shadow-glow ring-2 ring-cyan-500/30"
                              : "bg-slate-950/60 border-white/10 text-slate-400 hover:border-white/20 hover:text-slate-200"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs font-bold flex items-center gap-2 text-slate-200">
                              <Lock className="w-4 h-4 text-cyan-400" />
                              NO, Solo Venta Directa
                            </span>
                            {!formData.affiliateEnabled && (
                              <span className="w-4 h-4 rounded-full bg-cyan-500 flex items-center justify-center text-[10px] text-slate-950 font-bold">
                                ✓
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400 leading-relaxed">
                            Solo tú venderás el producto a través de tus enlaces propios y te quedas con el 90% neto.
                          </p>
                        </button>
                      </div>

                      {/* DETAILED AFFILIATE OPTIONS (When YES is selected) */}
                      {formData.affiliateEnabled ? (
                        <div className="space-y-4 pt-4 border-t border-purple-500/20 animate-in fade-in duration-150">
                          {/* Commission Percentage Slider & Quick Buttons */}
                          <div className="bg-slate-950/80 p-4 rounded-2xl border border-white/5 space-y-2.5">
                            <div className="flex items-center justify-between">
                              <label className="text-xs font-bold text-white flex items-center gap-1.5">
                                <span>Porcentaje de Comisión para el Afiliado:</span>
                                <span className="text-sm font-black font-mono text-purple-300">
                                  {formData.affiliateCommissionPct}%
                                </span>
                              </label>
                              <span className="text-xs text-emerald-400 font-mono font-bold">
                                +${((numPrice * formData.affiliateCommissionPct) / 100).toFixed(2)} USD / venta
                              </span>
                            </div>

                            {/* Range Slider */}
                            <input
                              type="range"
                              min="5"
                              max="80"
                              step="5"
                              name="affiliateCommissionPct"
                              value={formData.affiliateCommissionPct}
                              onChange={handleChange}
                              className="w-full accent-purple-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
                            />

                            {/* Quick Select Buttons */}
                            <div className="flex flex-wrap gap-1.5 pt-1">
                              {[15, 20, 30, 40, 50, 60, 70, 80].map((pct) => (
                                <button
                                  key={pct}
                                  type="button"
                                  onClick={() => setFormData((prev) => ({ ...prev, affiliateCommissionPct: pct }))}
                                  className={`text-[11px] font-mono font-bold px-2.5 py-1 rounded-lg border transition-all ${
                                    formData.affiliateCommissionPct === pct
                                      ? "bg-purple-600 text-white border-purple-400 shadow-glow"
                                      : "bg-slate-900 text-slate-400 border-white/5 hover:text-white hover:border-purple-500/40"
                                  }`}
                                >
                                  {pct}%
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Approval Mode */}
                          <div className="bg-slate-950/80 p-4 rounded-2xl border border-white/5 space-y-2">
                            <label className="block text-xs font-semibold text-slate-300">
                              Modo de Aprobación de Afiliados
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                              <button
                                type="button"
                                onClick={() => setFormData((prev) => ({ ...prev, affiliateApprovalMode: "AUTO" }))}
                                className={`p-3 rounded-xl border text-left transition-all ${
                                  formData.affiliateApprovalMode === "AUTO"
                                    ? "bg-purple-950/80 border-purple-500 text-white shadow-glow"
                                    : "bg-slate-900 border-white/5 text-slate-400 hover:text-white"
                                }`}
                              >
                                <div className="flex items-center gap-2 mb-1">
                                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                                  <span className="text-xs font-bold">⚡ Automática (Inmediata)</span>
                                </div>
                                <p className="text-[10px] text-slate-400 leading-tight">
                                  Cualquier afiliado puede obtener su enlace y empezar a vender de inmediato. (Recomendado)
                                </p>
                              </button>

                              <button
                                type="button"
                                onClick={() => setFormData((prev) => ({ ...prev, affiliateApprovalMode: "MANUAL" }))}
                                className={`p-3 rounded-xl border text-left transition-all ${
                                  formData.affiliateApprovalMode === "MANUAL"
                                    ? "bg-purple-950/80 border-purple-500 text-white shadow-glow"
                                    : "bg-slate-900 border-white/5 text-slate-400 hover:text-white"
                                }`}
                              >
                                <div className="flex items-center gap-2 mb-1">
                                  <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                                  <span className="text-xs font-bold">🛡️ Aprobación Manual</span>
                                </div>
                                <p className="text-[10px] text-slate-400 leading-tight">
                                  Revisas las solicitudes de los promotores antes de darles acceso a los enlaces.
                                </p>
                              </button>
                            </div>
                          </div>

                          {/* Affiliate Swipe / Marketing Materials Link */}
                          <div className="bg-slate-950/80 p-4 rounded-2xl border border-white/5 space-y-1.5">
                            <label className="block text-xs font-semibold text-slate-300">
                              Recursos de Marketing para tus Afiliados (Google Drive, Dropbox, Notion)
                            </label>
                            <input
                              type="url"
                              name="affiliateSwipeUrl"
                              value={formData.affiliateSwipeUrl}
                              onChange={handleChange}
                              placeholder="https://drive.google.com/drive/folders/mis-creativos-y-anuncios"
                              className="input-falcon text-xs w-full py-2 font-mono"
                            />
                            <span className="text-[10px] text-slate-500 block">
                              Opcional: Comparte fotos, copys y banners para que tus promotores vendan más.
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="p-3.5 rounded-2xl bg-cyan-950/20 border border-cyan-500/20 text-xs text-slate-300 flex items-center gap-2.5">
                          <Check className="w-4 h-4 text-cyan-400 shrink-0" />
                          <span>
                            Modo venta directa activo. Recibirás el <strong>90% neto</strong> de cada compra generada a través de tu link de producto.
                          </span>
                        </div>
                      )}
                      {/* Visual Store Customizer Accordion */}
                      <div className="bg-slate-950/80 p-4 sm:p-5 rounded-2xl border border-cyan-500/30 space-y-4">
                        <div className="flex items-center justify-between pb-2 border-b border-white/5">
                          <label className="text-xs font-bold text-white flex items-center gap-1.5">
                            <Sparkles className="w-4 h-4 text-cyan-400" />
                            <span>Diseñador Visual de tu Tienda</span>
                          </label>
                          <span className="text-[10px] text-cyan-400 font-semibold">Personalización Total</span>
                        </div>

                        {/* Paletas de Color */}
                        <div className="space-y-2">
                          <span className="text-[11px] font-semibold text-slate-300 block">Estilo & Paleta de Color:</span>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {[
                              { name: "Cyber Cyan", p: "#06b6d4", s: "#3b82f6", bg: "#030712", label: "💎 Cyber Cyan" },
                              { name: "Royal Purple", p: "#8b5cf6", s: "#ec4899", bg: "#050510", label: "👑 Royal Purple" },
                              { name: "Emerald Fintech", p: "#10b981", s: "#059669", bg: "#020e09", label: "🌿 Emerald" },
                              { name: "Sunset Amber", p: "#f59e0b", s: "#ef4444", bg: "#0f0803", label: "🔥 Sunset Glow" },
                              { name: "Neon Rose", p: "#ec4899", s: "#f43f5e", bg: "#0f030a", label: "🌸 Neon Rose" },
                              { name: "Obsidian Gold", p: "#eab308", s: "#ca8a04", bg: "#080808", label: "⚡ Obsidian Gold" },
                              { name: "Clean Light", p: "#0284c7", s: "#0f172a", bg: "#f8fafc", label: "☀️ Clean Light" },
                            ].map((t) => (
                              <button
                                key={t.name}
                                type="button"
                                onClick={() => setFormData((prev) => ({ ...prev, primaryColor: t.p, secondaryColor: t.s, backgroundColor: t.bg }))}
                                className={`p-2 rounded-xl border text-left transition-all flex items-center justify-between text-xs ${
                                  formData.primaryColor === t.p
                                    ? "bg-slate-900 border-cyan-400 shadow-glow text-white font-bold"
                                    : "bg-slate-950 border-white/10 text-slate-400 hover:text-white"
                                }`}
                              >
                                <span>{t.label}</span>
                                <div className="w-3 h-3 rounded-full border border-white/20" style={{ backgroundColor: t.p }} />
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Banner & Badge */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <label className="text-[11px] font-semibold text-slate-300">Banner de Cabecera (Hero):</label>
                              <button
                                type="button"
                                onClick={() => bannerInputRef.current?.click()}
                                disabled={uploadingBanner}
                                className="text-[10px] bg-purple-950/80 hover:bg-purple-900 border border-purple-500/40 text-purple-300 px-2 py-0.5 rounded-lg font-bold flex items-center gap-1 transition-all"
                              >
                                <Upload className="w-3 h-3" />
                                <span>{uploadingBanner ? "Subiendo..." : "📁 Subir de Galería"}</span>
                              </button>
                              <input
                                ref={bannerInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleBannerUpload}
                              />
                            </div>
                            <input
                              type="url"
                              name="bannerImageUrl"
                              value={formData.bannerImageUrl}
                              onChange={handleChange}
                              placeholder="https://images.unsplash.com/... o sube tu archivo"
                              className="input-falcon text-xs w-full py-1.5"
                            />
                            {formData.bannerImageUrl && (
                              <div className="relative rounded-xl overflow-hidden h-14 border border-white/10 bg-slate-900">
                                <img src={formData.bannerImageUrl} alt="Banner" className="w-full h-full object-cover" />
                                <button
                                  type="button"
                                  onClick={() => setFormData((prev) => ({ ...prev, bannerImageUrl: "" }))}
                                  className="absolute top-1 right-1 bg-rose-600 text-white p-0.5 rounded text-[10px]"
                                >
                                  ✕
                                </button>
                              </div>
                            )}
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[11px] font-semibold text-slate-300">Insignia / Badge de Oferta:</label>
                            <input
                              type="text"
                              name="customBadgeText"
                              value={formData.customBadgeText}
                              onChange={handleChange}
                              placeholder="Ej: 🔥 Más Vendido • 50% OFF"
                              className="input-falcon text-xs w-full py-1.5"
                            />
                          </div>
                        </div>

                        {/* CTA Text & Subtext */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                          <div className="space-y-1">
                            <label className="text-[11px] font-semibold text-slate-300">Texto Botón de Compra (CTA):</label>
                            <input
                              type="text"
                              name="ctaButtonText"
                              value={formData.ctaButtonText}
                              onChange={handleChange}
                              placeholder={formData.productType === "PHYSICAL" ? "Comprar y Recibir Pedido" : "Comprar con Garantía Protegida"}
                              className="input-falcon text-xs w-full py-1.5"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[11px] font-semibold text-slate-300">Subtexto de Garantía:</label>
                            <input
                              type="text"
                              name="ctaSubtext"
                              value={formData.ctaSubtext}
                              onChange={handleChange}
                              placeholder="Pago Seguro cifrado con entrega inmediata"
                              className="input-falcon text-xs w-full py-1.5"
                            />
                          </div>
                        </div>

                        {/* Gallery Photos Section */}
                        <div className="space-y-2 pt-2 border-t border-white/5">
                          <div className="flex items-center justify-between">
                            <label className="text-[11px] font-bold text-slate-200 flex items-center gap-1.5">
                              <ImageIcon className="w-3.5 h-3.5 text-cyan-400" />
                              <span>Galería de Fotos del Producto ({galleryImages.length}):</span>
                            </label>
                            <button
                              type="button"
                              onClick={() => galleryInputRef.current?.click()}
                              disabled={uploadingGallery}
                              className="btn-falcon-primary text-[10px] py-1 px-2.5 flex items-center gap-1 font-bold"
                            >
                              <Upload className="w-3 h-3" />
                              <span>{uploadingGallery ? "Subiendo fotos..." : "📁 Importar de Galería"}</span>
                            </button>
                            <input
                              ref={galleryInputRef}
                              type="file"
                              accept="image/*"
                              multiple
                              className="hidden"
                              onChange={handleGalleryUpload}
                            />
                          </div>

                          <div className="flex gap-2">
                            <input
                              type="url"
                              value={customImageUrl}
                              onChange={(e) => setCustomImageUrl(e.target.value)}
                              placeholder="O añade URL directa de imagen..."
                              className="input-falcon text-xs flex-1 py-1"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                if (customImageUrl.trim()) {
                                  setGalleryImages([...galleryImages, customImageUrl.trim()]);
                                  setCustomImageUrl("");
                                }
                              }}
                              className="btn-falcon-secondary text-[11px] py-1 px-3"
                            >
                              + Añadir
                            </button>
                          </div>

                          {galleryImages.length > 0 && (
                            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 pt-1">
                              {galleryImages.map((img, idx) => (
                                <div key={idx} className="relative group rounded-lg overflow-hidden aspect-square border border-white/10 bg-slate-900">
                                  <img src={img} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover" />
                                  <button
                                    type="button"
                                    onClick={() => setGalleryImages(galleryImages.filter((_, i) => i !== idx))}
                                    className="absolute top-1 right-1 bg-rose-600 text-white p-0.5 rounded text-[10px]"
                                  >
                                    ✕
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Highlights Manager */}
                        <div className="space-y-2 pt-2 border-t border-white/5">
                          <label className="text-[11px] font-bold text-slate-200 block">
                            Puntos Clave & Beneficios ({highlights.length}):
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={newHighlight}
                              onChange={(e) => setNewHighlight(e.target.value)}
                              placeholder="Ej: Envío gratis 24hs • Material 100% garantizado"
                              className="input-falcon text-xs flex-1 py-1.5"
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  if (newHighlight.trim()) {
                                    setHighlights([...highlights, newHighlight.trim()]);
                                    setNewHighlight("");
                                  }
                                }
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => {
                                if (newHighlight.trim()) {
                                  setHighlights([...highlights, newHighlight.trim()]);
                                  setNewHighlight("");
                                }
                              }}
                              className="btn-falcon-primary text-xs py-1.5 px-3 font-bold"
                            >
                              + Agregar
                            </button>
                          </div>
                          {highlights.length > 0 && (
                            <div className="space-y-1 pt-1">
                              {highlights.map((h, i) => (
                                <div key={i} className="flex items-center justify-between bg-slate-900 px-3 py-1 rounded-lg text-xs text-slate-300">
                                  <span>✓ {h}</span>
                                  <button type="button" onClick={() => setHighlights(highlights.filter((_, idx) => idx !== i))} className="text-slate-500 hover:text-rose-400">✕</button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Earnings & Split Summary Widget */}
                <div className="glass-panel p-5 rounded-2xl border border-cyan-500/30 bg-slate-950/90 flex flex-col justify-between space-y-4 shadow-glow">
                  <div>
                    <span className="text-[10px] uppercase font-mono font-bold text-cyan-400 block mb-1">
                      Desglose de Ganancias
                    </span>
                    <h3 className="text-base font-bold text-white mb-4">Lo que recibes por venta</h3>

                    <div className="space-y-3 text-xs">
                      <div className="flex justify-between text-slate-300">
                        <span>Precio al comprador:</span>
                        <span className="font-mono font-bold text-white">
                          {formatCurrency(numPrice, "USD")}
                        </span>
                      </div>

                      {formData.affiliateEnabled && (
                        <div className="flex justify-between text-purple-300">
                          <span>Comisión Afiliado ({formData.affiliateCommissionPct}%):</span>
                          <span className="font-mono text-purple-300 font-bold">
                            - {formatCurrency(split.affiliateCommissionAmount, "USD")}
                          </span>
                        </div>
                      )}

                      <div className="flex justify-between text-slate-400">
                        <span>Tarifa fija FALKO (25 UYU):</span>
                        <span className="font-mono text-slate-400">
                          - {formatCurrency(split.platformFeeConverted, "USD")}
                        </span>
                      </div>

                      <div className="pt-3 border-t border-white/10 flex justify-between items-center text-emerald-400">
                        <span className="font-bold">Tu Ganancia Neta:</span>
                        <span className="text-xl font-black font-mono">
                          {formatCurrency(split.sellerEarningAmount, "USD")}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Ready to Publish Button */}
                  <div className="pt-4 border-t border-white/10">
                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={loading}
                      className="w-full btn-falcon-primary py-3.5 text-sm font-bold shadow-glow flex items-center justify-center gap-2"
                    >
                      <Rocket className="w-4 h-4" />
                      <span>{loading ? "Publicando Producto..." : "¡Publicar Producto Ahora!"}</span>
                    </button>
                    <span className="text-[10px] text-slate-400 text-center block mt-2">
                      Garantía protegida y pasarelas globales activas al instante.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 💎 MODO 2: PRO STUDIO AVANZADO (Módulos, Bump, Píxeles, Cupones) */}
      {/* ========================================================================= */}
      {creationMode === "pro" && (
        <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in duration-200">
          {/* Main Info */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6">
            <div className="flex items-center gap-2 pb-4 border-b border-white/5">
              <Sparkles className="w-5 h-5 text-cyan-400" />
              <h2 className="text-base font-bold text-white">1. Información del Producto</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Título del Producto *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  placeholder="ej: SaaS Boilerplate Ultra"
                  className="input-falcon text-sm w-full py-2.5"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Biografía / Descripción del Producto *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  required
                  placeholder="Escribe la biografía o descripción de tu producto (puede ser corta o detallada)..."
                  className="input-falcon text-xs w-full py-2.5 resize-y"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Esta biografía y descripción se mostrará a tus compradores en tu tienda y catálogo.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Categoría
                </label>
                <select
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleChange}
                  className="input-falcon text-xs w-full py-2.5"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Garantía Protegida
                </label>
                <select
                  name="guaranteeDays"
                  value={formData.guaranteeDays}
                  onChange={handleChange}
                  className="input-falcon text-xs w-full py-2.5"
                >
                  <option value={0}>0 días (Sin Garantía / Pago Inmediato)</option>
                  <option value={7}>7 días de garantía</option>
                  <option value={14}>14 días de garantía</option>
                  <option value={30}>30 días de garantía</option>
                </select>
              </div>

              {/* Visibilidad Pro */}
              <div className="sm:col-span-2 bg-slate-950/80 p-4 rounded-2xl border border-white/5 space-y-3">
                <label className="block text-xs font-bold text-white flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-cyan-400" />
                  <span>Visibilidad & Distribución:</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, inMarketplace: true }))}
                    className={`p-3 rounded-xl border text-left transition-all flex items-start gap-3 ${
                      formData.inMarketplace
                        ? "bg-cyan-950/60 border-cyan-400 text-white shadow-glow"
                        : "bg-slate-900/60 border-white/5 text-slate-400 hover:text-white"
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${formData.inMarketplace ? "bg-cyan-500/20 text-cyan-400" : "bg-white/5 text-slate-400"}`}>
                      <Store className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold flex items-center gap-1.5">
                        <span>🌐 Público en Marketplace</span>
                        {formData.inMarketplace && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5 leading-tight">
                        Aparece en catálogo, buscador y marketplace de FALKO.
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, inMarketplace: false }))}
                    className={`p-3 rounded-xl border text-left transition-all flex items-start gap-3 ${
                      !formData.inMarketplace
                        ? "bg-cyan-950/60 border-cyan-400 text-white shadow-glow"
                        : "bg-slate-900/60 border-white/5 text-slate-400 hover:text-white"
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${!formData.inMarketplace ? "bg-cyan-500/20 text-cyan-400" : "bg-white/5 text-slate-400"}`}>
                      <LinkIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold flex items-center gap-1.5">
                        <span>🔗 Oculto (Solo Link Directo)</span>
                        {!formData.inMarketplace && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5 leading-tight">
                        No visible en catálogo. Solo accesible con tu enlace directo.
                      </p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Formato Pro */}
              <div className="sm:col-span-2 bg-slate-950/80 p-4 rounded-2xl border border-white/5 space-y-3">
                <label className="block text-xs font-bold text-white">
                  Formato de Entrega:
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, productType: "DIGITAL" }))}
                    className={`p-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                      formData.productType === "DIGITAL"
                        ? "bg-cyan-950 border-cyan-400 text-cyan-300 shadow-glow"
                        : "bg-slate-900 border-white/5 text-slate-400 hover:text-white"
                    }`}
                  >
                    <Zap className="w-4 h-4 text-cyan-400" />
                    <span>⚡ Producto Digital</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, productType: "PHYSICAL" }))}
                    className={`p-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                      formData.productType === "PHYSICAL"
                        ? "bg-cyan-950 border-cyan-400 text-cyan-300 shadow-glow"
                        : "bg-slate-900 border-white/5 text-slate-400 hover:text-white"
                    }`}
                  >
                    <Package className="w-4 h-4 text-cyan-400" />
                    <span>📦 Producto Físico</span>
                  </button>
                </div>

                {formData.productType === "PHYSICAL" && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                        Stock Disponible *
                      </label>
                      <input
                        type="number"
                        min="0"
                        name="stock"
                        value={formData.stock}
                        onChange={handleChange}
                        className="input-falcon text-xs w-full py-2 font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                        Costo de Envío (USD)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        name="shippingFee"
                        value={formData.shippingFee}
                        onChange={handleChange}
                        className="input-falcon text-xs w-full py-2 font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                        Tiempo de Entrega
                      </label>
                      <input
                        type="text"
                        name="estimatedDeliveryDays"
                        value={formData.estimatedDeliveryDays}
                        onChange={handleChange}
                        placeholder="24 a 48 hs hábiles"
                        className="input-falcon text-xs w-full py-2"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Descripción Completa (Markdown soportado)
              </label>
              <textarea
                rows={5}
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Explica qué incluye, características y beneficios..."
                className="input-falcon text-xs w-full py-2.5 resize-none font-mono"
              />
            </div>
          </div>

          {/* Pricing & Order Bump */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6">
            <div className="flex items-center gap-2 pb-4 border-b border-white/5">
              <DollarSign className="w-5 h-5 text-emerald-400" />
              <h2 className="text-base font-bold text-white">2. Precio & Venta Adicional (Order Bump)</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Precio Base (USD) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  className="input-falcon text-sm font-mono w-full py-2.5"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Título de Order Bump (Opcional)
                </label>
                <input
                  type="text"
                  name="orderBumpTitle"
                  value={formData.orderBumpTitle}
                  onChange={handleChange}
                  placeholder="ej: + Plantilla Notion Exclusiva (9.99 USD)"
                  className="input-falcon text-xs w-full py-2.5"
                />
              </div>
            </div>
          </div>

          {/* Affiliate Program Configuration (Pro Mode) */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-purple-500/30 bg-purple-950/10 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-purple-500/20">
              <div className="flex items-center gap-2">
                <Percent className="w-5 h-5 text-purple-400" />
                <div>
                  <h2 className="text-base font-bold text-white">3. Programa de Afiliados & Comisiones</h2>
                  <p className="text-xs text-slate-400">Recluta un ejército de afiliados que vendan tu producto a cambio de una comisión.</p>
                </div>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="affiliateEnabled"
                  checked={formData.affiliateEnabled}
                  onChange={handleChange}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>

            {formData.affiliateEnabled && (
              <div className="space-y-6 animate-in fade-in duration-150">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-bold text-white">
                        Porcentaje de Comisión: <span className="text-purple-300 font-mono text-sm">{formData.affiliateCommissionPct}%</span>
                      </label>
                      <span className="text-xs text-emerald-400 font-mono font-bold">
                        ${( (numPrice * formData.affiliateCommissionPct) / 100 ).toFixed(2)} USD / venta
                      </span>
                    </div>

                    <input
                      type="range"
                      min="5"
                      max="80"
                      step="5"
                      name="affiliateCommissionPct"
                      value={formData.affiliateCommissionPct}
                      onChange={handleChange}
                      className="w-full accent-purple-500 h-2 bg-slate-800 rounded-lg cursor-pointer mb-3"
                    />

                    <div className="flex flex-wrap gap-1.5">
                      {[15, 20, 30, 40, 50, 60, 70, 80].map((pct) => (
                        <button
                          key={pct}
                          type="button"
                          onClick={() => setFormData((prev) => ({ ...prev, affiliateCommissionPct: pct }))}
                          className={`text-xs font-mono font-bold px-2.5 py-1 rounded-lg border transition-all ${
                            formData.affiliateCommissionPct === pct
                              ? "bg-purple-600 text-white border-purple-400 shadow-glow"
                              : "bg-slate-900/80 text-slate-400 border-white/5 hover:text-white"
                          }`}
                        >
                          {pct}%
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-2">
                      Modo de Aprobación
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, affiliateApprovalMode: "AUTO" }))}
                        className={`p-3 rounded-xl border text-left text-xs transition-all ${
                          formData.affiliateApprovalMode === "AUTO"
                            ? "bg-purple-950/80 border-purple-500 text-white font-bold"
                            : "bg-slate-900/60 border-white/5 text-slate-400"
                        }`}
                      >
                        <Zap className="w-3.5 h-3.5 text-amber-400 mb-1" />
                        <span>⚡ Automática</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, affiliateApprovalMode: "MANUAL" }))}
                        className={`p-3 rounded-xl border text-left text-xs transition-all ${
                          formData.affiliateApprovalMode === "MANUAL"
                            ? "bg-purple-950/80 border-purple-500 text-white font-bold"
                            : "bg-slate-900/60 border-white/5 text-slate-400"
                        }`}
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-cyan-400 mb-1" />
                        <span>🛡️ Manual</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Carpeta de Recursos para Afiliados (Swipe Files URL)
                  </label>
                  <input
                    type="url"
                    name="affiliateSwipeUrl"
                    value={formData.affiliateSwipeUrl}
                    onChange={handleChange}
                    placeholder="https://drive.google.com/drive/folders/mis-recursos-de-marketing"
                    className="input-falcon text-xs w-full py-2.5 font-mono"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Pixels & Tracking */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6">
            <div className="flex items-center gap-2 pb-4 border-b border-white/5">
              <Target className="w-5 h-5 text-purple-400" />
              <h2 className="text-base font-bold text-white">4. Píxeles de Conversión & Tráfico</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Meta Pixel ID (Facebook Ads)
                </label>
                <input
                  type="text"
                  name="metaPixelId"
                  value={formData.metaPixelId}
                  onChange={handleChange}
                  placeholder="1234567890"
                  className="input-falcon text-xs w-full py-2.5 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Google Analytics 4 ID
                </label>
                <input
                  type="text"
                  name="googleAnalyticsId"
                  value={formData.googleAnalyticsId}
                  onChange={handleChange}
                  placeholder="G-XXXXXXX"
                  className="input-falcon text-xs w-full py-2.5 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  TikTok Pixel ID
                </label>
                <input
                  type="text"
                  name="tiktokPixelId"
                  value={formData.tiktokPixelId}
                  onChange={handleChange}
                  placeholder="CXXXXXXXX"
                  className="input-falcon text-xs w-full py-2.5 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={loading}
              className="btn-falcon-primary py-3.5 px-8 text-sm font-bold shadow-glow flex items-center gap-2"
            >
              <Rocket className="w-4 h-4" />
              <span>{loading ? "Publicando..." : "Publicar Producto Pro"}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
