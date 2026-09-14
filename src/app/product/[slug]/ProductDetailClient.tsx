"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatCurrency, convertCurrency, COUNTRIES } from "@/lib/currency";
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  Copy,
  Download,
  FileCode,
  FileText,
  Globe,
  Lock,
  MessageSquare,
  Percent,
  Share2,
  ShieldCheck,
  Sparkles,
  Star,
  User,
  Zap,
} from "lucide-react";

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
  const [isRequestingApproval, setIsRequestingApproval] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("falko_currency");
    if (saved) setCurrency(saved);

    const handleCurrencyChange = (e: any) => {
      setCurrency(e.detail);
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
        setStatusMessage(data.message || "Enlace de afiliado generado.");
      } else {
        setStatusMessage(data.error || "Error al generar enlace.");
      }
    } catch {
      setStatusMessage("Error de conexión.");
    }
  };

  const handleCopyAffiliateLink = () => {
    if (!affiliateRecord) return;
    const origin = typeof window !== "undefined" ? window.location.origin : "https://falko.io";
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-slate-400 mb-6">
        <Link href="/marketplace" className="hover:text-cyan-400">
          Marketplace
        </Link>
        <span>/</span>
        <Link
          href={`/marketplace?category=${product.category.slug}`}
          className="hover:text-cyan-400"
        >
          {product.category.name}
        </Link>
        <span>/</span>
        <span className="text-slate-200 truncate max-w-[200px]">{product.title}</span>
      </div>

      {/* Main Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left Column: Media, Details, Description, Files, Reviews */}
        <div className="lg:col-span-2 space-y-8">
          {/* Main Cover Image */}
          <div className="glass-panel rounded-2xl overflow-hidden border border-slate-800 relative aspect-[16/9] shadow-2xl">
            <img
              src={product.coverImageUrl}
              alt={product.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 left-4 bg-slate-950/80 backdrop-blur-md text-xs font-bold text-cyan-300 px-3 py-1 rounded-lg border border-slate-800">
              {product.category.name}
            </div>
            {product.affiliateEnabled && (
              <div className="absolute top-4 right-4 bg-purple-950/90 backdrop-blur-md text-xs font-bold text-purple-300 px-3 py-1 rounded-lg border border-purple-800/70 flex items-center gap-1.5 shadow-md">
                <Percent className="w-3.5 h-3.5" />
                {product.affiliateCommissionPct}% Comisión Afiliado
              </div>
            )}
          </div>

          {/* Title & Metadata */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-heading font-black text-white leading-snug">
              {product.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-slate-400">
              <div className="flex items-center gap-1 text-amber-400 font-bold">
                <Star className="w-4 h-4 fill-amber-400" />
                <span>{product.ratingAvg.toFixed(1)}</span>
                <span className="text-slate-400 font-normal">
                  ({product.reviewsCount} opiniones)
                </span>
              </div>
              <span>•</span>
              <span className="font-mono text-slate-300">{product.salesCount} ventas confirmadas</span>
              <span>•</span>
              <div className="flex items-center gap-1 text-emerald-400 font-semibold">
                <ShieldCheck className="w-4 h-4" />
                <span>Garantía {product.guaranteeDays} días</span>
              </div>
            </div>
          </div>

          {/* Description Section */}
          <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-slate-800">
            <h3 className="text-lg font-heading font-bold text-white mb-4">
              Descripción del Producto
            </h3>
            <div className="text-slate-300 text-sm leading-relaxed whitespace-pre-line space-y-4">
              {product.description}
            </div>
          </div>

          {/* Included Digital Files Vault */}
          <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-heading font-bold text-white flex items-center gap-2">
                <FileCode className="w-5 h-5 text-cyan-400" />
                Archivos Digitales Incluidos ({product.files.length})
              </h3>
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Lock className="w-3.5 h-3.5 text-cyan-400" />
                Descarga Privada
              </span>
            </div>

            <div className="space-y-3">
              {product.files.map((file: any) => (
                <div
                  key={file.id}
                  className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-cyan-400">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold text-white block">{file.fileName}</span>
                      <span className="text-[11px] text-slate-500 font-mono">
                        {(file.fileSizeBytes / (1024 * 1024)).toFixed(1)} MB • {file.fileType}
                      </span>
                    </div>
                  </div>

                  {hasPurchased ? (
                    <Link
                      href="/library"
                      className="btn-falcon-primary text-[11px] py-1.5 px-3"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Descargar
                    </Link>
                  ) : (
                    <span className="text-slate-500 font-mono text-[11px] bg-slate-900 px-2 py-1 rounded">
                      Disponible tras compra
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Verified Customer Reviews Section */}
          <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-slate-800">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-lg font-heading font-bold text-white">
                  Opiniones de Compradores Verificados
                </h3>
                <p className="text-xs text-slate-400">
                  Solo clientes que completaron la compra pueden calificar este producto.
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-black font-mono text-amber-400 flex items-center gap-1 justify-end">
                  <Star className="w-6 h-6 fill-amber-400" />
                  {product.ratingAvg.toFixed(1)}
                </div>
                <span className="text-[11px] text-slate-500">{product.reviewsCount} opiniones</span>
              </div>
            </div>

            {product.reviews.length === 0 ? (
              <p className="text-xs text-slate-500 italic text-center py-6">
                Este producto aún no cuenta con opiniones públicas. Sé el primero en adquirirlo y dejar tu reseña.
              </p>
            ) : (
              <div className="space-y-4">
                {product.reviews.map((rev: any) => (
                  <div
                    key={rev.id}
                    className="bg-slate-950/50 border border-slate-800 rounded-xl p-4 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-bold text-white">
                          {rev.buyer?.firstName?.[0] || "U"}
                        </div>
                        <span className="text-xs font-bold text-white">
                          {rev.buyer?.firstName} {rev.buyer?.lastName}
                        </span>
                        <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800/60 px-1.5 py-0.2 rounded">
                          Compra Verificada
                        </span>
                      </div>
                      <div className="flex text-amber-400">
                        {Array.from({ length: rev.rating }).map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-amber-400" />
                        ))}
                      </div>
                    </div>

                    <h5 className="text-xs font-bold text-slate-200">{rev.title}</h5>
                    <p className="text-xs text-slate-400 leading-relaxed">{rev.comment}</p>

                    {rev.sellerReply && (
                      <div className="mt-3 ml-4 bg-slate-900 border-l-2 border-cyan-400 p-2.5 rounded-r-lg text-xs">
                        <span className="font-bold text-cyan-400 block mb-1">Respuesta del Creador:</span>
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
          <div className="glass-panel rounded-2xl p-6 border border-slate-800 sticky top-20 shadow-glow">
            {/* Guarantee Tag */}
            <div className="bg-emerald-950/60 border border-emerald-500/40 rounded-xl p-3 flex items-center gap-2.5 mb-5 text-emerald-300 text-xs">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <strong className="block text-white">Garantía Protegida {product.guaranteeDays} Días</strong>
                <span>Devolución del 100% de tus fondos si no cumple tus expectativas.</span>
              </div>
            </div>

            {/* Price Display */}
            <div className="mb-6">
              <span className="text-xs text-slate-400 block mb-1">Precio Final</span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black font-mono text-cyan-400">
                  {formatCurrency(convertedPrice, currency)}
                </span>
              </div>
              {currency !== product.currencyCode && (
                <span className="text-xs text-slate-500 font-mono block mt-0.5">
                  Precio Base: {formatCurrency(product.price, product.currencyCode)}
                </span>
              )}
            </div>

            {/* Purchase CTA */}
            {isSeller ? (
              <div className="bg-slate-900 border border-slate-700 rounded-xl p-3 text-center text-xs text-slate-400">
                <AlertTriangle className="w-4 h-4 text-amber-400 mx-auto mb-1" />
                Eres el creador de este producto.
              </div>
            ) : hasPurchased ? (
              <div className="space-y-2">
                <div className="bg-emerald-950/40 border border-emerald-800 text-emerald-300 text-xs p-3 rounded-xl text-center">
                  ✓ Ya tienes este producto en tu biblioteca
                </div>
                <Link
                  href="/library"
                  className="btn-falcon-primary w-full text-center justify-center text-sm py-3"
                >
                  Acceder al Contenido
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                <Link
                  href={checkoutUrl}
                  className="btn-falcon-primary w-full text-center justify-center text-sm py-3 shadow-glow"
                >
                  <Zap className="w-4 h-4" />
                  Comprar Ahora
                </Link>

                <p className="text-[11px] text-slate-400 text-center flex items-center justify-center gap-1">
                  <Lock className="w-3 h-3 text-cyan-400" />
                  Pago Seguro cifrado con entrega inmediata
                </p>
              </div>
            )}

            {/* Seller Information */}
            <div className="mt-6 pt-5 border-t border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-slate-800 overflow-hidden border border-slate-700">
                  {product.seller.avatarUrl ? (
                    <img
                      src={product.seller.avatarUrl}
                      alt={product.seller.firstName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-cyan-800 flex items-center justify-center text-xs font-bold text-white">
                      {product.seller.firstName[0]}
                    </div>
                  )}
                </div>
                <div>
                  <span className="text-[10px] uppercase text-slate-400 block font-semibold">
                    Creado por
                  </span>
                  <span className="text-xs font-bold text-white">
                    {product.seller.firstName} {product.seller.lastName}
                  </span>
                </div>
              </div>
              <span className="text-lg">
                {COUNTRIES[product.seller.countryCode]?.flag || "🌐"}
              </span>
            </div>
          </div>

          {/* ======================================================== */}
          {/* AFFILIATE PROGRAM SECTION FOR THIS PRODUCT               */}
          {/* ======================================================== */}
          {product.affiliateEnabled && !isSeller && (
            <div className="glass-panel rounded-2xl p-6 border border-purple-800/40 shadow-glow relative">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Share2 className="w-5 h-5 text-purple-400" />
                  <h4 className="font-heading font-bold text-white text-sm">
                    Programa de Afiliados
                  </h4>
                </div>
                <span className="text-xs font-bold font-mono text-purple-400 bg-purple-950/80 px-2 py-0.5 rounded border border-purple-800">
                  {product.affiliateCommissionPct}% Comisión
                </span>
              </div>

              <p className="text-xs text-slate-300 mb-3">
                Gana hasta <strong className="text-white font-mono">{formatCurrency(convertedAffiliateEst, currency)}</strong> por cada venta referida con tu enlace único.
              </p>

              {affiliateRecord && affiliateRecord.status === "APPROVED" ? (
                <div className="space-y-3 bg-slate-950/80 p-3.5 rounded-xl border border-purple-900/50">
                  <span className="text-[11px] font-semibold text-emerald-400 block">
                    ✓ Enlace de afiliado activo:
                  </span>
                  <div className="flex items-center gap-1.5 bg-slate-900 p-2 rounded-lg border border-slate-800">
                    <input
                      readOnly
                      value={`${typeof window !== "undefined" ? window.location.origin : ""}/product/${product.slug}?ref=${affiliateRecord.uniqueRefCode}`}
                      className="bg-transparent text-[11px] text-slate-300 flex-1 outline-none font-mono truncate"
                    />
                    <button
                      onClick={handleCopyAffiliateLink}
                      className="btn-falcon-primary text-[10px] py-1 px-2.5"
                    >
                      {copiedLink ? <Check className="w-3 h-3 text-black" /> : <Copy className="w-3 h-3 text-black" />}
                      {copiedLink ? "Copiado" : "Copiar"}
                    </button>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-400 pt-1">
                    <span>Clics: <strong>{affiliateRecord.clicksCount}</strong></span>
                    <span>Ventas: <strong>{affiliateRecord.conversionsCount}</strong></span>
                  </div>
                </div>
              ) : affiliateRecord && affiliateRecord.status === "PENDING" ? (
                <div className="bg-amber-950/40 border border-amber-800 p-3 rounded-xl text-center text-xs text-amber-300">
                  Solicitud en revisión manual por el creador.
                </div>
              ) : (
                <div className="space-y-2">
                  <button
                    onClick={generateAffiliateLink}
                    className="w-full btn-falcon-secondary text-xs py-2.5 justify-center hover:border-purple-400 text-purple-300"
                  >
                    <Percent className="w-3.5 h-3.5 text-purple-400" />
                    {product.affiliateApprovalMode === "AUTO"
                      ? "Obtener Enlace de Afiliado (Auto)"
                      : "Solicitar Aprobación de Afiliado"}
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
    </div>
  );
}
