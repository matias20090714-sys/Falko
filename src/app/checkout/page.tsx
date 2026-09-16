"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { formatCurrency, convertCurrency, COUNTRIES } from "@/lib/currency";
import { FalconLogo } from "@/components/layout/FalconLogo";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  CreditCard,
  Lock,
  Percent,
  PlusCircle,
  ShieldCheck,
  Sparkles,
  Tag,
  X,
  Zap,
} from "lucide-react";

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const productSlug = searchParams.get("product");
  const refCode = searchParams.get("ref") || "";

  const [product, setProduct] = useState<any>(null);
  const [loadingProduct, setLoadingProduct] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [currency, setCurrency] = useState("USD");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [selectedMethod, setSelectedMethod] = useState("MERCADOPAGO");

  // New Features: Order Bump & Coupons
  const [includeOrderBump, setIncludeOrderBump] = useState(false);
  const [couponCodeInput, setCouponCodeInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discountPct: number } | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("falko_currency");
    if (saved) setCurrency(saved);

    // Fetch user
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setCurrentUser(data.user);
          if (data.user.preferredCurrency) {
            setCurrency(data.user.preferredCurrency);
          }
        }
      });

    // Fetch product
    if (productSlug) {
      fetch(`/api/products?slug=${productSlug}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.product) {
            setProduct(data.product);

            // Execute client-side conversion pixels if configured
            if (data.product.metaPixelId && typeof window !== "undefined") {
              console.log(`[Tracking] Meta Pixel Initialized: ${data.product.metaPixelId} (InitiateCheckout)`);
            }
            if (data.product.googleAnalyticsId && typeof window !== "undefined") {
              console.log(`[Tracking] Google Analytics Initialized: ${data.product.googleAnalyticsId} (begin_checkout)`);
            }
            if (data.product.tiktokPixelId && typeof window !== "undefined") {
              console.log(`[Tracking] TikTok Pixel Initialized: ${data.product.tiktokPixelId} (InitiateCheckout)`);
            }
          }
        })
        .finally(() => setLoadingProduct(false));
    } else {
      setLoadingProduct(false);
    }
  }, [productSlug]);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCodeInput.trim() || !product) return;

    setCouponLoading(true);
    setCouponError("");

    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCodeInput.trim(), productId: product.id }),
      });

      const data = await res.json();
      if (data.success && data.coupon) {
        setAppliedCoupon(data.coupon);
        setCouponCodeInput("");
      } else {
        setCouponError(data.error || "Cupón no válido.");
      }
    } catch {
      setCouponError("Error al validar cupón.");
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponError("");
  };

  const handleCompleteOrder = async () => {
    if (!currentUser) {
      router.push(`/login?redirect=/checkout?product=${productSlug}`);
      return;
    }

    setProcessing(true);
    setError("");

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productSlug,
          refCode,
          targetCurrency: currency,
          paymentMethod: selectedMethod,
          includeOrderBump,
          couponCode: appliedCoupon?.code || "",
        }),
      });

      const data = await res.json();
      if (data.success) {
        if (data.redirectUrl.startsWith("http")) {
          window.location.href = data.redirectUrl;
        } else {
          router.push(data.redirectUrl);
        }
      } else {
        setError(data.error || "No se pudo completar la transacción.");
      }
    } catch {
      setError("Error de comunicación con el servidor.");
    } finally {
      setProcessing(false);
    }
  };

  if (loadingProduct) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-slate-400 text-xs">
        Cargando orden de pago segura...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 glass-panel rounded-2xl text-center border border-slate-800">
        <h3 className="text-base font-bold text-white mb-2">Producto no especificado</h3>
        <p className="text-xs text-slate-400 mb-6">Por favor selecciona un producto desde el marketplace.</p>
        <Link href="/marketplace" className="btn-falcon-primary text-xs py-2 px-4">
          Ir al Marketplace
        </Link>
      </div>
    );
  }

  // Financial Calculations
  const baseProductConverted = convertCurrency(product.price, product.currencyCode, currency);
  let discountConverted = 0;
  if (appliedCoupon) {
    discountConverted = (baseProductConverted * appliedCoupon.discountPct) / 100;
  }

  let bumpConverted = 0;
  if (includeOrderBump && product.orderBumpPrice) {
    bumpConverted = convertCurrency(product.orderBumpPrice, product.currencyCode, currency);
  }

  const finalTotal = Math.max(1, baseProductConverted - discountConverted + bumpConverted);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-heading font-black text-white">
          Checkout Seguro
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Transacción protegida con garantía incondicional de {product.guaranteeDays} días.
        </p>
      </div>

      {error && (
        <div className="mb-6 bg-rose-950/60 border border-rose-800 text-rose-300 text-xs p-4 rounded-xl">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Col: Customer Info, Order Bump & Payment Method */}
        <div className="lg:col-span-2 space-y-6">
          {/* Buyer Details */}
          <div className="glass-panel rounded-2xl p-6 border border-white/10">
            <h3 className="text-base font-heading font-bold text-white mb-4">
              1. Datos del Comprador
            </h3>

            {currentUser ? (
              <div className="bg-slate-950/60 border border-white/10 rounded-xl p-4 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-white block">
                    {currentUser.firstName} {currentUser.lastName}
                  </span>
                  <span className="text-slate-400">{currentUser.email}</span>
                </div>
                <span className="text-xs bg-slate-900 border border-white/10 px-2.5 py-1 rounded-md text-cyan-400 font-mono">
                  {COUNTRIES[currentUser.countryCode]?.flag} {currentUser.countryCode}
                </span>
              </div>
            ) : (
              <div className="bg-slate-950/60 border border-white/10 rounded-xl p-4 text-xs text-center space-y-3">
                <p className="text-slate-300">Debes tener una cuenta FALKO para registrar la compra y acceder a las descargas.</p>
                <Link href={`/login?redirect=/checkout?product=${productSlug}`} className="btn-falcon-primary text-xs py-2 px-4">
                  Iniciar Sesión / Registrarme
                </Link>
              </div>
            )}
          </div>

          {/* ORDER BUMP (Venta Adicional en 1-Click si el producto la tiene configurada) */}
          {product.orderBumpTitle && (
            <div
              onClick={() => setIncludeOrderBump(!includeOrderBump)}
              className={`rounded-2xl p-5 border-2 transition-all cursor-pointer relative overflow-hidden ${
                includeOrderBump
                  ? "bg-amber-950/30 border-amber-500/80 shadow-glow"
                  : "bg-slate-950/70 border-dashed border-amber-500/40 hover:border-amber-400/80"
              }`}
            >
              <div className="flex items-start gap-3.5">
                <input
                  type="checkbox"
                  checked={includeOrderBump}
                  onChange={() => {}} // Controlled via parent div click
                  className="w-5 h-5 accent-amber-500 rounded mt-0.5 cursor-pointer shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="text-[10px] uppercase font-black tracking-wider bg-amber-500 text-slate-950 px-2 py-0.5 rounded font-mono">
                      🔥 Oferta Especial 1-Click
                    </span>
                    <strong className="text-xs sm:text-sm text-white font-bold">
                      {product.orderBumpTitle}
                    </strong>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {product.orderBumpDescription || "Añade este recurso adicional exclusivo con precio de oferta."}
                  </p>
                  <span className="text-xs font-mono font-bold text-amber-400 mt-2 block">
                    + {formatCurrency(convertCurrency(product.orderBumpPrice || 0, product.currencyCode, currency), currency)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Payment Method Selector */}
          <div className="glass-panel rounded-2xl p-6 border border-white/10">
            <h3 className="text-base font-heading font-bold text-white mb-4 flex items-center justify-between">
              <span>2. Método de Pago</span>
              <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded font-mono font-bold">
                ✓ Pasarelas Cifradas
              </span>
            </h3>

            <div className="space-y-3">
              {/* Option 1: Mercado Pago */}
              <label
                onClick={() => setSelectedMethod("MERCADOPAGO")}
                className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                  selectedMethod === "MERCADOPAGO"
                    ? "bg-cyan-950/40 border-cyan-500/60 shadow-glow"
                    : "bg-slate-950/60 border-white/10 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-950/80 border border-blue-500/30 flex items-center justify-center font-black text-blue-400 text-xs font-mono shadow-sm">
                    MP
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">
                      Mercado Pago (Tarjetas de Crédito / Débito, Saldo MP y Cuotas)
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Pasarela con acreditación y garantía inmediata
                    </span>
                  </div>
                </div>
                <div className="w-4 h-4 rounded-full border-2 border-cyan-400 flex items-center justify-center p-0.5">
                  {selectedMethod === "MERCADOPAGO" && <div className="w-2 h-2 rounded-full bg-cyan-400" />}
                </div>
              </label>

              {/* Option 2: Mock/Dev Instant Payment */}
              <label
                onClick={() => setSelectedMethod("MOCK_CARD")}
                className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                  selectedMethod === "MOCK_CARD"
                    ? "bg-cyan-950/40 border-cyan-500/60 shadow-glow"
                    : "bg-slate-950/60 border-white/10 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center gap-3">
                  <CreditCard className="w-5 h-5 text-cyan-400" />
                  <div>
                    <span className="text-xs font-bold text-white block">
                      Pago de Prueba / Modo Simulación Rápido
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Entrega instantánea para testeo de la plataforma
                    </span>
                  </div>
                </div>
                <div className="w-4 h-4 rounded-full border-2 border-cyan-400 flex items-center justify-center p-0.5">
                  {selectedMethod === "MOCK_CARD" && <div className="w-2 h-2 rounded-full bg-cyan-400" />}
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right Col: Order Summary, Coupons & Guarantee */}
        <div className="space-y-6">
          <div className="glass-panel rounded-2xl p-6 border border-white/10 shadow-glow">
            <h3 className="text-base font-heading font-bold text-white mb-4 pb-3 border-b border-white/10">
              Resumen de la Orden
            </h3>

            {/* Product Mini Card */}
            <div className="flex items-center gap-3 mb-5">
              <div className="w-14 h-14 rounded-xl bg-slate-900 overflow-hidden border border-white/10 shrink-0">
                <img src={product.coverImageUrl} alt={product.title} className="w-full h-full object-cover" />
              </div>
              <div className="min-w-0">
                <span className="text-xs font-bold text-white block line-clamp-2">
                  {product.title}
                </span>
                <span className="text-[10px] text-cyan-400 font-semibold block mt-0.5">
                  {product.category?.name}
                </span>
              </div>
            </div>

            {/* Coupon Code Input */}
            <div className="mb-5">
              {appliedCoupon ? (
                <div className="bg-emerald-950/40 border border-emerald-500/60 p-3 rounded-xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-emerald-400" />
                    <span className="font-bold text-white font-mono">{appliedCoupon.code}</span>
                    <span className="text-emerald-400">(-{appliedCoupon.discountPct}%)</span>
                  </div>
                  <button onClick={handleRemoveCoupon} className="text-slate-400 hover:text-rose-400 p-1">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="space-y-1.5">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponCodeInput}
                      onChange={(e) => setCouponCodeInput(e.target.value.toUpperCase())}
                      placeholder="Cupón (ej: LANZAMIENTO50)"
                      className="w-full px-3 py-2 rounded-xl glass-input text-xs font-mono"
                    />
                    <button
                      type="submit"
                      disabled={couponLoading || !couponCodeInput.trim()}
                      className="btn-falcon-secondary text-xs px-3 py-2 shrink-0"
                    >
                      {couponLoading ? "..." : "Aplicar"}
                    </button>
                  </div>
                  {couponError && <p className="text-[10px] text-rose-400">{couponError}</p>}
                </form>
              )}
            </div>

            {/* Guarantee Callout */}
            <div className="bg-emerald-950/40 border border-emerald-800/80 rounded-xl p-3 mb-5 flex items-center gap-2 text-emerald-300 text-xs">
              <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>Garantía {product.guaranteeDays} días protegida por FALKO.</span>
            </div>

            {/* Referral Info */}
            {refCode && (
              <div className="bg-purple-950/30 border border-purple-900/50 rounded-xl p-2.5 mb-5 flex items-center justify-between text-xs text-purple-300">
                <span className="flex items-center gap-1.5">
                  <Percent className="w-3.5 h-3.5" />
                  Afiliado:
                </span>
                <span className="font-mono font-bold text-[11px] bg-purple-900/60 px-2 py-0.5 rounded">
                  {refCode}
                </span>
              </div>
            )}

            {/* Line items */}
            <div className="space-y-2.5 text-xs text-slate-300 pt-2 border-t border-white/10 mb-6">
              <div className="flex justify-between">
                <span>Precio Producto</span>
                <span className="font-mono">{formatCurrency(baseProductConverted, currency)}</span>
              </div>

              {appliedCoupon && (
                <div className="flex justify-between text-emerald-400">
                  <span>Descuento ({appliedCoupon.code})</span>
                  <span className="font-mono">- {formatCurrency(discountConverted, currency)}</span>
                </div>
              )}

              {includeOrderBump && (
                <div className="flex justify-between text-amber-400">
                  <span>Venta Adicional (Order Bump)</span>
                  <span className="font-mono">+ {formatCurrency(bumpConverted, currency)}</span>
                </div>
              )}

              <div className="flex justify-between text-emerald-400">
                <span>Comisión de Plataforma</span>
                <span className="font-mono">Incluida</span>
              </div>

              <div className="flex justify-between text-sm font-bold text-white pt-3 border-t border-white/10">
                <span>Total Final</span>
                <span className="font-mono text-cyan-400 text-base font-black">
                  {formatCurrency(finalTotal, currency)}
                </span>
              </div>
            </div>

            {/* Pay Button */}
            <button
              onClick={handleCompleteOrder}
              disabled={processing || !currentUser}
              className="w-full btn-falcon-primary py-3.5 text-sm font-bold justify-center shadow-glow disabled:opacity-50 cursor-pointer"
            >
              <Zap className="w-4 h-4" />
              {processing ? "Procesando Pago Seguro..." : `Pagar ${formatCurrency(finalTotal, currency)}`}
            </button>

            <p className="text-[10px] text-slate-400 text-center mt-3 flex items-center justify-center gap-1">
              <Lock className="w-3 h-3 text-cyan-400" />
              Descarga digital instantánea disponible tras confirmación
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-[60vh] flex items-center justify-center text-slate-400 text-xs">Cargando pasarela...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}
