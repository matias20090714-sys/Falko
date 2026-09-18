"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatCurrency, convertCurrency, COUNTRIES } from "@/lib/currency";
import { getVideoEmbedUrl } from "@/lib/media";
import {
  AlertTriangle,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronDown,
  Copy,
  Download,
  ExternalLink,
  Eye,
  FileCode,
  FileText,
  Film,
  Globe,
  HelpCircle,
  Image as ImageIcon,
  Lock,
  MessageSquare,
  Percent,
  Play,
  RefreshCw,
  Share2,
  ShieldCheck,
  Sparkles,
  Star,
  User,
  Zap,
} from "lucide-react";
import { WhatsAppChatButton } from "@/components/shared/WhatsAppChatButton";
import { QrCodeModal } from "@/components/shared/QrCodeModal";

interface ProductDetailClientProps {
  product: any;
  currentUser: any;
  affiliateProductRecord: any;
  hasPurchased: boolean;
  refCodeParam: string;
}

export function ProductDetailClient({
  product,
  currentUser,
  affiliateProductRecord: initialAffiliateRecord,
  hasPurchased,
  refCodeParam,
}: ProductDetailClientProps) {
  const router = useRouter();
  const [currency, setCurrency] = useState("USD");
  const [affiliateRecord, setAffiliateRecord] = useState<any>(initialAffiliateRecord);
  const [copiedLink, setCopiedLink] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Gallery and Media view state
  const allImages = [
    product.coverImageUrl,
    ...(product.images ? product.images.map((i: any) => i.imageUrl || i) : []),
  ].filter(Boolean);

  const [selectedImage, setSelectedImage] = useState<string>(allImages[0] || product.coverImageUrl);
  const [activeMediaTab, setActiveMediaTab] = useState<"image" | "video">(
    product.videoUrl ? "image" : "image"
  );

  const parsedVideo = product.videoUrl ? getVideoEmbedUrl(product.videoUrl) : null;

  useEffect(() => {
    const saved = localStorage.getItem("falko_currency");
    if (saved) setCurrency(saved);

    const handleCurrencyChange = (e: any) => {
      if (e.detail) setCurrency(e.detail);
    };

    window.addEventListener("currencyChange", handleCurrencyChange);
    return () => window.removeEventListener("currencyChange", handleCurrencyChange);
  }, []);

  const convertedPrice = convertCurrency(product.price, product.currencyCode, currency);
  const affiliateEarningsEst = (product.price * product.affiliateCommissionPct) / 100;
  const convertedAffiliateEst = convertCurrency(affiliateEarningsEst, product.currencyCode, currency);

  // Generate or obtain affiliate link
  const generateAffiliateLink = async () => {
    if (!currentUser) {
      router.push(`/login?redirect=/product/${product.slug}`);
      return;
    }

    try {
      const res = await fetch("/api/affiliates/generate-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id }),
      });

      const data = await res.json();
      if (data.success) {
        setAffiliateRecord(data.affiliateProduct);
        setStatusMessage(data.message || "Enlace de afiliado generado con éxito.");
      } else {
        setStatusMessage(data.error || "Error al generar enlace.");
      }
    } catch {
      setStatusMessage("Error de conexión.");
    }
  };

  const handleCopyAffiliateLink = () => {
    if (!affiliateRecord) return;
    const origin = typeof window !== "undefined" ? window.location.origin : "https://falko.dpdns.org";
    const link = `${origin}/product/${product.slug}?ref=${affiliateRecord.uniqueRefCode}`;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const isSeller = currentUser?.id === product.sellerId;

  // Compute checkout URL
  const checkoutUrl = `/checkout?product=${product.slug}${
    refCodeParam ? `&ref=${refCodeParam}` : ""
  }`;

  // Product FAQs
  const productFaqs = [
    {
      q: "¿Cómo y cuándo recibo acceso al producto?",
      a: "El acceso es inmediato y automático. En cuanto tu pago es procesado (con tarjeta, Mercado Pago, PIX, SPEI o USDT), serás redirigido a tu bóveda personal con los enlaces de acceso privados o archivos descargables. También recibirás un correo de confirmación.",
    },
    {
      q: `¿Cómo funciona la garantía protegida de ${product.guaranteeDays} días?`,
      a: `Tu dinero está completamente protegido en garantía por FALKO durante ${product.guaranteeDays} días. Si el producto no cumple con lo prometido en la descripción, puedes solicitar un reembolso directo desde tu panel sin preguntas complicadas.`,
    },
    {
      q: "¿Qué medios de pago están disponibles?",
      a: "Aceptamos tarjetas de crédito/débito internacionales (Visa, Mastercard), Mercado Pago, Criptomonedas USDT (en redes Solana y Polygon con 0% comisión de red) y métodos locales según tu país como PIX en Brasil, SPEI en México o PSE en Colombia.",
    },
    {
      q: "¿Es un pago único o tiene mensualidades?",
      a: "Es un pago único y definitivo. No existen cobros recurrentes ni membresías ocultas a menos que el producto especifique explícitamente lo contrario en su descripción.",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Conversion Trust Bar */}
      <div className="bg-slate-950/70 border border-white/10 rounded-2xl p-3 sm:p-3.5 backdrop-blur-xl grid grid-cols-2 md:grid-cols-4 gap-2.5 text-center text-xs shadow-lg">
        <div className="flex items-center justify-center gap-2 text-emerald-400">
          <ShieldCheck className="w-4 h-4 shrink-0" />
          <span className="font-bold">Garantía {product.guaranteeDays} Días Protegida</span>
        </div>
        <div className="flex items-center justify-center gap-2 text-cyan-300">
          <Zap className="w-4 h-4 text-cyan-400 shrink-0" />
          <span className="font-bold">Entrega Inmediata al Pagar</span>
        </div>
        <div className="flex items-center justify-center gap-2 text-purple-300">
          <Lock className="w-4 h-4 text-purple-400 shrink-0" />
          <span className="font-bold">Cifrado Bancario SSL</span>
        </div>
        <div className="flex items-center justify-center gap-2 text-amber-300">
          <MessageSquare className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="font-bold">Soporte con el Creador</span>
        </div>
      </div>

      {/* External Custom Landing Page Banner (if seller configured one) */}
      {product.salesPageUrl && (
        <div className="bg-gradient-to-r from-cyan-950/80 via-slate-900 to-slate-950 p-4 rounded-2xl border border-cyan-500/40 shadow-glow flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 text-xs text-slate-200">
            <Globe className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>
              Este producto cuenta con una <strong>página de presentación externa</strong> personalizada por el autor.
            </span>
          </div>
          <a
            href={product.salesPageUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-falcon-primary text-xs py-1.5 px-4 flex items-center gap-1.5 shrink-0"
          >
            <span>Ver Landing Page Oficial</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      )}

      {/* Breadcrumb & Social QR Share Action */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Link href="/marketplace" className="hover:text-cyan-400">
            Marketplace
          </Link>
          <span>/</span>
          <Link
            href={`/marketplace?category=${product.category?.slug || ""}`}
            className="hover:text-cyan-400 font-semibold"
          >
            {product.category?.name || "Digital"}
          </Link>
          <span>/</span>
          <span className="text-slate-200 truncate max-w-[200px]">{product.title}</span>
        </div>

        {/* QR Code & Share Action */}
        <QrCodeModal 
          productTitle={product.title} 
          productSlug={product.slug} 
          refCode={refCodeParam || affiliateRecord?.uniqueRefCode} 
        />
      </div>

      {/* Main Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 sm:gap-10">
        {/* Left Column: Media Gallery, Video, Details, Description, Files, FAQs, Reviews */}
        <div className="lg:col-span-2 space-y-8">
          {/* Main Media Player / Gallery Container */}
          <div className="glass-panel rounded-3xl overflow-hidden border border-white/10 shadow-2xl space-y-3 p-4">
            {/* Media Tabs if Video exists */}
            {product.videoUrl && (
              <div className="flex items-center gap-2 border-b border-white/10 pb-3">
                <button
                  type="button"
                  onClick={() => setActiveMediaTab("image")}
                  className={`text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-colors ${
                    activeMediaTab === "image"
                      ? "bg-cyan-950 text-cyan-300 border border-cyan-500/40 shadow-glow"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>Galería de Fotos ({allImages.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveMediaTab("video")}
                  className={`text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-colors ${
                    activeMediaTab === "video"
                      ? "bg-purple-950 text-purple-300 border border-purple-500/40 shadow-glow"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Film className="w-3.5 h-3.5 text-purple-400" />
                  <span>Video Demo en Vivo</span>
                </button>
              </div>
            )}

            {/* Display active media */}
            {activeMediaTab === "video" && parsedVideo ? (
              <div className="relative aspect-[16/9] rounded-2xl overflow-hidden bg-black border border-purple-500/30">
                {parsedVideo.type === "youtube" || parsedVideo.type === "vimeo" || parsedVideo.type === "loom" ? (
                  <iframe
                    src={parsedVideo.embedUrl}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <video src={parsedVideo.embedUrl} controls className="w-full h-full object-contain" />
                )}
              </div>
            ) : (
              <div className="relative aspect-[16/9] rounded-2xl overflow-hidden bg-slate-950 border border-white/10">
                <img
                  src={selectedImage}
                  alt={product.title}
                  className="w-full h-full object-cover transition-all duration-300"
                />
                <div className="absolute top-4 left-4 bg-slate-950/85 backdrop-blur-md text-xs font-bold text-cyan-300 px-3 py-1 rounded-xl border border-white/10 shadow-lg">
                  {product.category?.name || "Recurso Digital"}
                </div>
                {product.affiliateEnabled && (
                  <div className="absolute top-4 right-4 bg-purple-950/90 backdrop-blur-md text-xs font-bold text-purple-300 px-3 py-1 rounded-xl border border-purple-500/40 flex items-center gap-1.5 shadow-lg">
                    <Percent className="w-3.5 h-3.5" />
                    <span>{product.affiliateCommissionPct}% Afiliados</span>
                  </div>
                )}
              </div>
            )}

            {/* Thumbnail Strip (if more than 1 image) */}
            {allImages.length > 1 && (
              <div className="flex gap-2.5 overflow-x-auto pb-1 pt-1">
                {allImages.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setSelectedImage(imgUrl);
                      setActiveMediaTab("image");
                    }}
                    className={`relative w-20 aspect-video rounded-xl overflow-hidden shrink-0 border transition-all ${
                      selectedImage === imgUrl && activeMediaTab === "image"
                        ? "border-cyan-400 ring-2 ring-cyan-500/40 scale-105 shadow-glow"
                        : "border-white/10 opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img src={imgUrl} alt={`Miniatura ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Title & Metadata */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold bg-cyan-950/80 text-cyan-300 border border-cyan-500/30 px-3 py-1 rounded-full shadow-glow">
                {product.category?.name || "Recurso Digital"}
              </span>
              <span className="text-xs font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Producto Verificado</span>
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-black text-white leading-[1.15] tracking-tight">
              {product.title}
            </h1>

            {product.shortDescription && (
              <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
                {product.shortDescription}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-slate-300">
              {product.reviewsCount && product.reviewsCount > 0 ? (
                <div className="flex items-center gap-1 text-amber-400 font-bold">
                  <Star className="w-4 h-4 fill-amber-400" />
                  <span>{product.ratingAvg ? product.ratingAvg.toFixed(1) : "5.0"}</span>
                  <span className="text-slate-400 font-normal">
                    ({product.reviewsCount} opiniones verificadas)
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-cyan-300 font-bold">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <span>⭐ 100% Calidad Garantizada</span>
                </div>
              )}
              <span>•</span>
              <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                <ShieldCheck className="w-4 h-4" />
                <span>Garantía de Satisfacción {product.guaranteeDays} Días</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1.5 text-purple-300 font-semibold">
                <Lock className="w-3.5 h-3.5 text-purple-400" />
                <span>Entrega Inmediata</span>
              </div>
            </div>
          </div>

          {/* High-Conversion 4-Pillar Value Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-white/5 space-y-1">
              <Zap className="w-5 h-5 text-cyan-400" />
              <strong className="text-xs font-bold text-white block">Acceso de por Vida</strong>
              <span className="text-[11px] text-slate-400 block leading-tight">Sin suscripciones ni cobros extra</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-white/5 space-y-1">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <strong className="text-xs font-bold text-white block">Garantía Total</strong>
              <span className="text-[11px] text-slate-400 block leading-tight">{product.guaranteeDays} días de prueba segura</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-white/5 space-y-1">
              <Lock className="w-5 h-5 text-purple-400" />
              <strong className="text-xs font-bold text-white block">Bóveda Cifrada</strong>
              <span className="text-[11px] text-slate-400 block leading-tight">Descarga privada y segura</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-white/5 space-y-1">
              <MessageSquare className="w-5 h-5 text-amber-400" />
              <strong className="text-xs font-bold text-white block">Soporte Creador</strong>
              <span className="text-[11px] text-slate-400 block leading-tight">Atención directa vía WhatsApp</span>
            </div>
          </div>

          {/* Special Post-Purchase Access Banner (if user already owns it) */}
          {hasPurchased && (product.accessUrl || (product.files && product.files.length > 0)) && (
            <div className="bg-emerald-950/40 border-2 border-emerald-500/60 rounded-3xl p-6 shadow-glow space-y-4">
              <div className="flex items-center gap-2 text-emerald-300 font-bold text-base">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>¡Producto Comprado! Accede a tu contenido aquí</span>
              </div>

              {product.accessUrl && (
                <div className="bg-slate-900/90 p-4 rounded-2xl border border-emerald-800/60 space-y-2">
                  <span className="text-xs font-bold text-white block">🔗 Enlace de Acceso Privado:</span>
                  <div className="flex items-center gap-3">
                    <a
                      href={product.accessUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-falcon-primary text-xs py-2 px-4 flex items-center gap-1.5"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Abrir Plataforma / Recurso Externo
                    </a>
                  </div>
                  {product.accessInstructions && (
                    <p className="text-xs text-slate-300 pt-1 leading-relaxed whitespace-pre-line bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                      <strong>Instrucciones:</strong> {product.accessInstructions}
                    </p>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-slate-300">
                  Gestiona todas tus compras y descargas en tu biblioteca personal.
                </span>
                <Link href="/library" className="btn-falcon-secondary text-xs py-1.5 px-3">
                  Ir a mi Biblioteca
                </Link>
              </div>
            </div>
          )}

          {/* Detailed Description Section */}
          <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-white/5">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <h3 className="text-lg font-heading font-bold text-white">
                ¿Qué incluye este producto y qué beneficios obtendrás?
              </h3>
            </div>
            <div className="text-slate-200 text-sm sm:text-base leading-relaxed whitespace-pre-line space-y-4">
              {product.description}
            </div>
          </div>

          {/* Deliverables Section (Real files in vault or direct access) */}
          {(product.files && product.files.length > 0) ? (
            <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <FileCode className="w-5 h-5 text-cyan-400" />
                  <h3 className="text-lg font-heading font-bold text-white">
                    Archivos Digitales Listos para Descargar ({product.files.length})
                  </h3>
                </div>
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5 text-cyan-400" />
                  Bóveda Segura Cifrada
                </span>
              </div>

              <div className="space-y-3">
                {product.files.map((file: any) => (
                  <div
                    key={file.id || file.fileName}
                    className="bg-slate-950/80 border border-white/10 rounded-2xl p-4 flex items-center justify-between text-xs hover:border-cyan-500/30 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-center text-cyan-400 shadow-sm">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <strong className="text-white block text-sm font-semibold">{file.fileName}</strong>
                        <span className="text-[11px] text-slate-400">
                          {(file.fileSizeBytes / (1024 * 1024)).toFixed(1)} MB • {file.fileType}
                        </span>
                      </div>
                    </div>

                    {hasPurchased ? (
                      <Link
                        href="/library"
                        className="btn-falcon-primary text-xs py-2 px-4 font-bold shadow-glow flex items-center gap-1"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Descargar</span>
                      </Link>
                    ) : (
                      <span className="text-cyan-300 text-xs bg-cyan-950/60 border border-cyan-500/30 px-3 py-1.5 rounded-xl font-semibold">
                        ⚡ Entrega Inmediata
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : product.accessUrl ? (
            <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <ExternalLink className="w-5 h-5 text-cyan-400" />
                  <h3 className="text-lg font-heading font-bold text-white">
                    Acceso Exclusivo & Entrega Digital
                  </h3>
                </div>
                <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4" />
                  Garantía Protegida
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Este producto se entrega con enlace privado de acceso exclusivo (Notion, Drive, Comunidad o Plataforma) inmediatamente después de confirmado el pago.
              </p>
            </div>
          ) : null}

          {/* 3 Simple Steps to Access */}
          <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 space-y-6">
            <div className="flex items-center gap-2 pb-3 border-b border-white/5">
              <Zap className="w-5 h-5 text-cyan-400" />
              <h3 className="text-lg font-heading font-bold text-white">
                Cómo Funciona tu Compra en 3 Pasos Sencillos
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-950/70 border border-white/5 p-4 rounded-2xl space-y-2 relative">
                <div className="w-8 h-8 rounded-xl bg-cyan-950 border border-cyan-500/40 text-cyan-300 font-black text-sm flex items-center justify-center">
                  1
                </div>
                <h4 className="text-xs sm:text-sm font-bold text-white">Elige tu Forma de Pago</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Paga con Tarjeta, Mercado Pago, PIX, SPEI o USDT con 0% comisiones ocultas.
                </p>
              </div>

              <div className="bg-slate-950/70 border border-white/5 p-4 rounded-2xl space-y-2 relative">
                <div className="w-8 h-8 rounded-xl bg-purple-950 border border-purple-500/40 text-purple-300 font-black text-sm flex items-center justify-center">
                  2
                </div>
                <h4 className="text-xs sm:text-sm font-bold text-white">Cifrado Seguro SSL</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Tus datos viajan 100% cifrados con protección bancaria de grado empresarial.
                </p>
              </div>

              <div className="bg-slate-950/70 border border-white/5 p-4 rounded-2xl space-y-2 relative">
                <div className="w-8 h-8 rounded-xl bg-emerald-950 border border-emerald-500/40 text-emerald-300 font-black text-sm flex items-center justify-center">
                  3
                </div>
                <h4 className="text-xs sm:text-sm font-bold text-white">Acceso Inmediato & Vitalicio</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Obtén tus enlaces y descargas al instante en tu Bóveda Privada de por vida.
                </p>
              </div>
            </div>
          </div>

          {/* Money Back Zero-Risk Guarantee Seal Box */}
          <div className="bg-gradient-to-r from-emerald-950/60 via-slate-950 to-slate-950 border-2 border-emerald-500/40 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6 shadow-glow">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-tr from-emerald-500/20 to-cyan-500/20 border-2 border-emerald-400/60 flex flex-col items-center justify-center text-center p-2 shrink-0 shadow-lg">
              <ShieldCheck className="w-9 h-9 text-emerald-400 mb-1" />
              <span className="text-[10px] font-black uppercase text-emerald-300 tracking-wider">
                {product.guaranteeDays} DÍAS
              </span>
            </div>
            <div className="space-y-2 text-center sm:text-left">
              <span className="text-[11px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                Garantía Total de Satisfacción 100% Cero Riesgo
              </span>
              <h4 className="text-lg sm:text-xl font-heading font-black text-white">
                Pruébalo con Total Tranquilidad
              </h4>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Adquiere este producto hoy y explóralo sin riesgo. Si dentro de los primeros{" "}
                <strong className="text-white font-bold">{product.guaranteeDays} días</strong> sientes que no cumple tus expectativas, puedes solicitar el reembolso de tu dinero con un solo clic desde tu panel.
              </p>
            </div>
          </div>

          {/* Product FAQ Accordion */}
          <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-white/5">
              <HelpCircle className="w-5 h-5 text-cyan-400" />
              <h3 className="text-lg font-heading font-bold text-white">
                Preguntas Frecuentes sobre la Compra
              </h3>
            </div>

            <div className="space-y-3">
              {productFaqs.map((faq, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div
                    key={idx}
                    className="rounded-2xl border border-white/5 bg-slate-950/60 overflow-hidden transition-all"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                      className="w-full text-left p-4 flex items-center justify-between text-xs sm:text-sm font-bold text-white hover:text-cyan-300 transition-colors"
                    >
                      <span>{faq.q}</span>
                      <ChevronDown
                        className={`w-4 h-4 text-slate-400 transition-transform ${
                          isOpen ? "rotate-180 text-cyan-400" : ""
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-4 pb-4 pt-1 text-xs text-slate-300 leading-relaxed border-t border-white/5">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Verified Customer Reviews Section */}
          <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div>
                <h3 className="text-lg font-heading font-bold text-white">
                  Opiniones de Compradores Verificados
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Solo clientes con compra confirmada pueden calificar este recurso.
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-black text-amber-400 flex items-center gap-1 justify-end">
                  <Star className="w-5 h-5 fill-amber-400" />
                  {product.ratingAvg && product.ratingAvg > 0 ? product.ratingAvg.toFixed(1) : "5.0"}
                </div>
                <span className="text-[11px] text-slate-400">{product.reviewsCount || 0} opiniones</span>
              </div>
            </div>

            {!product.reviews || product.reviews.length === 0 ? (
              <div className="text-center py-8 space-y-2">
                <Sparkles className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-xs text-slate-400 italic">
                  Este producto aún no cuenta con opiniones públicas. Sé el primero en adquirirlo y dejar tu reseña.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {product.reviews.map((rev: any) => (
                  <div
                    key={rev.id}
                    className="bg-slate-950/60 border border-white/5 rounded-2xl p-4 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-xl bg-slate-800 flex items-center justify-center text-xs font-bold text-white">
                          {rev.buyer?.firstName?.[0] || "U"}
                        </div>
                        <span className="text-xs font-bold text-white">
                          {rev.buyer?.firstName} {rev.buyer?.lastName}
                        </span>
                        <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800/60 px-2 py-0.5 rounded-full font-bold">
                          ✓ Compra Verificada
                        </span>
                      </div>
                      <div className="flex text-amber-400">
                        {Array.from({ length: rev.rating }).map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                        ))}
                      </div>
                    </div>

                    <h5 className="text-xs font-bold text-slate-200">{rev.title}</h5>
                    <p className="text-xs text-slate-400 leading-relaxed">{rev.comment}</p>

                    {rev.sellerReply && (
                      <div className="mt-3 ml-3 bg-slate-900 border-l-2 border-cyan-400 p-3 rounded-r-xl text-xs space-y-1">
                        <span className="font-bold text-cyan-400 block text-[11px]">Respuesta del Creador:</span>
                        <p className="text-slate-300">{rev.sellerReply}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Sticky Column: Purchase Box & Affiliate Actions */}
        <div className="space-y-6">
          {/* Purchase Card */}
          <div className="glass-panel rounded-3xl p-6 sm:p-7 border border-cyan-500/30 sticky top-20 shadow-glow space-y-6">
            {/* Guarantee Tag */}
            <div className="bg-emerald-950/60 border border-emerald-500/40 rounded-2xl p-3.5 flex items-center gap-3 text-emerald-300 text-xs">
              <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0" />
              <div>
                <strong className="block text-white">Garantía Protegida {product.guaranteeDays} Días</strong>
                <span className="text-[11px] text-slate-300">Reembolso 100% automático si no cumple tus expectativas.</span>
              </div>
            </div>

            {/* Price Display */}
            <div>
              <span className="text-xs text-slate-400 block mb-1">Precio Final</span>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black text-white font-heading">
                  {formatCurrency(convertedPrice, currency)}
                </span>
              </div>
              {currency !== product.currencyCode && (
                <span className="text-xs text-slate-400 block mt-1">
                  Precio Base: {formatCurrency(product.price, product.currencyCode)}
                </span>
              )}
            </div>

            {/* Purchase CTA */}
            {isSeller ? (
              <div className="bg-slate-900 border border-slate-700 rounded-2xl p-4 text-center text-xs text-slate-300 space-y-2">
                <AlertTriangle className="w-5 h-5 text-amber-400 mx-auto" />
                <p className="font-bold text-white">Eres el creador de este producto.</p>
                <Link
                  href={`/seller/products/${product.id}/edit`}
                  className="btn-falcon-primary text-xs py-2 px-4 inline-flex items-center gap-1.5 font-bold mt-1"
                >
                  <span>Editar este Producto</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ) : hasPurchased ? (
              <div className="space-y-2.5">
                <div className="bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs p-3.5 rounded-2xl text-center font-bold">
                  ✓ Ya tienes este producto en tu biblioteca
                </div>
                <Link
                  href="/library"
                  className="btn-falcon-primary w-full text-center justify-center text-xs py-3.5 font-bold shadow-glow"
                >
                  Acceder a mis Descargas
                </Link>
              </div>
            ) : (
              <div className="space-y-3.5">
                <Link
                  href={checkoutUrl}
                  className="btn-falcon-primary w-full text-center justify-center text-sm py-3.5 shadow-glow font-bold flex items-center gap-2"
                >
                  <Zap className="w-4 h-4" />
                  <span>Comprar con Garantía Protegida</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <p className="text-[11px] text-slate-400 text-center flex items-center justify-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Pago Seguro cifrado con entrega inmediata</span>
                </p>
              </div>
            )}

            {/* Accepted Payments Icons Badge */}
            <div className="pt-3 border-t border-white/10 space-y-2">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider text-center">
                MÉTODOS DE PAGO ACEPTADOS
              </span>
              <div className="flex flex-wrap items-center justify-center gap-1.5 text-[10px] text-slate-300">
                <span className="px-2 py-1 bg-slate-900 rounded-lg border border-white/5 font-bold">💳 Tarjetas</span>
                <span className="px-2 py-1 bg-slate-900 rounded-lg border border-white/5 font-bold text-cyan-300">Mercado Pago</span>
                <span className="px-2 py-1 bg-slate-900 rounded-lg border border-white/5 font-bold text-emerald-300">USDT 0% fee</span>
                <span className="px-2 py-1 bg-slate-900 rounded-lg border border-white/5 font-bold">PIX / SPEI / PSE</span>
              </div>
            </div>

            {/* Seller Information */}
            <div className="pt-4 border-t border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-slate-900 overflow-hidden border border-white/10 shadow-sm">
                  {product.seller?.avatarUrl ? (
                    <img
                      src={product.seller.avatarUrl}
                      alt={product.seller.firstName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-xs font-bold text-slate-950">
                      {product.seller?.firstName?.[0] || "C"}
                    </div>
                  )}
                </div>
                <div>
                  <span className="text-[10px] uppercase text-slate-400 block font-bold">
                    Creado por
                  </span>
                  <span className="text-xs font-bold text-white">
                    {product.seller?.firstName} {product.seller?.lastName}
                  </span>
                </div>
              </div>
              <span className="text-xl">
                {COUNTRIES[product.seller?.countryCode]?.flag || "🌐"}
              </span>
            </div>
          </div>

          {/* Direct WhatsApp Pre-sale Questions Card */}
          <WhatsAppChatButton
            sellerPhone={product.seller?.phone || (isSeller ? currentUser?.phone : null)}
            sellerName={product.seller?.firstName || "el Creador"}
            sellerCountryCode={product.seller?.countryCode || currentUser?.countryCode}
            productTitle={product.title}
            variant="card"
          />

          {/* ======================================================== */}
          {/* AFFILIATE PROGRAM SECTION FOR THIS PRODUCT               */}
          {/* ======================================================== */}
          {product.affiliateEnabled && !isSeller && (
            <div className="glass-panel rounded-3xl p-6 border border-purple-500/30 shadow-glow relative space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Share2 className="w-5 h-5 text-purple-400" />
                  <h4 className="font-heading font-bold text-white text-sm">
                    Programa de Afiliados
                  </h4>
                </div>
                <span className="text-xs font-bold text-purple-300 bg-purple-950/80 px-2.5 py-1 rounded-full border border-purple-500/40">
                  {product.affiliateCommissionPct}% Comisión
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Gana hasta <strong className="text-white font-bold">{formatCurrency(convertedAffiliateEst, currency)}</strong> por cada venta referida con tu enlace único.
              </p>

              {affiliateRecord && affiliateRecord.status === "APPROVED" ? (
                <div className="space-y-3 bg-slate-950/80 p-3.5 rounded-2xl border border-purple-900/50">
                  <span className="text-[11px] font-semibold text-emerald-400 block">
                    ✓ Tu enlace de afiliado está activo:
                  </span>
                  <div className="flex items-center gap-1.5 bg-slate-900 p-2 rounded-xl border border-white/10">
                    <input
                      readOnly
                      value={`${typeof window !== "undefined" ? window.location.origin : ""}/product/${product.slug}?ref=${affiliateRecord.uniqueRefCode}`}
                      className="bg-transparent text-[11px] text-slate-300 flex-1 outline-none truncate"
                    />
                    <button
                      onClick={handleCopyAffiliateLink}
                      className="btn-falcon-primary text-[10px] py-1 px-3 font-bold"
                    >
                      {copiedLink ? <Check className="w-3 h-3 text-black" /> : <Copy className="w-3 h-3 text-black" />}
                      <span>{copiedLink ? "Copiado" : "Copiar"}</span>
                    </button>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-400 pt-1">
                    <span>Clics: <strong className="text-white">{affiliateRecord.clicksCount}</strong></span>
                    <span>Ventas: <strong className="text-emerald-400">{affiliateRecord.conversionsCount}</strong></span>
                  </div>
                </div>
              ) : affiliateRecord && affiliateRecord.status === "PENDING" ? (
                <div className="bg-amber-950/40 border border-amber-800 p-3.5 rounded-2xl text-center text-xs text-amber-300">
                  Solicitud en revisión manual por el creador.
                </div>
              ) : (
                <div className="space-y-2">
                  <button
                    onClick={generateAffiliateLink}
                    className="w-full btn-falcon-secondary text-xs py-2.5 justify-center hover:border-purple-400 text-purple-300 font-bold"
                  >
                    <Percent className="w-3.5 h-3.5 text-purple-400" />
                    <span>
                      {product.affiliateApprovalMode === "AUTO"
                        ? "Generar Enlace de Afiliado (Auto)"
                        : "Solicitar Aprobación de Afiliado"}
                    </span>
                  </button>
                  {statusMessage && (
                    <p className="text-[11px] text-cyan-400 text-center">{statusMessage}</p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Floating WhatsApp Pre-sale Button for Instant Mobile/Desktop Reach */}
      <WhatsAppChatButton
        sellerPhone={product.seller?.phone || (isSeller ? currentUser?.phone : null)}
        sellerName={product.seller?.firstName || "el Creador"}
        sellerCountryCode={product.seller?.countryCode || currentUser?.countryCode}
        productTitle={product.title}
        variant="floating"
      />

      {/* Mobile Sticky Bottom CTA */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#05070e]/95 backdrop-blur-2xl border-t border-cyan-500/30 p-3.5 shadow-2xl safe-bottom">
        <div className="flex items-center justify-between gap-3 max-w-md mx-auto">
          <div>
            <span className="text-[10px] text-slate-400 block">Precio Digital</span>
            <span className="text-base font-black text-cyan-400">
              {formatCurrency(convertedPrice, currency)}
            </span>
          </div>
          <Link
            href={checkoutUrl}
            className="btn-falcon-primary py-2.5 px-6 text-xs font-bold shadow-glow flex items-center gap-1.5"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Comprar Ahora</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
