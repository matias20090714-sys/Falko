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
  Clock,
  Coins,
  Copy,
  CreditCard,
  Globe,
  Lock,
  Percent,
  PlusCircle,
  QrCode,
  ShieldCheck,
  Sparkles,
  Tag,
  Wallet,
  X,
  Zap,
} from "lucide-react";

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const productSlug = searchParams.get("product");
  const refCode = searchParams.get("ref") || "";
  const initialCoupon = searchParams.get("coupon") || "";

  const [product, setProduct] = useState<any>(null);
  const [loadingProduct, setLoadingProduct] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [currency, setCurrency] = useState("USD");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  
  // Payment methods: MERCADOPAGO | CRYPTO | PIX | SPEI | PSE | BROU_PREX | MOCK_CARD
  const [selectedMethod, setSelectedMethod] = useState("MERCADOPAGO");
  const [cryptoNetwork, setCryptoNetwork] = useState<"solana" | "polygon">("solana");
  const [copiedCrypto, setCopiedCrypto] = useState(false);

  // Features: Order Bump & Coupons
  const [includeOrderBump, setIncludeOrderBump] = useState(false);
  const [couponCodeInput, setCouponCodeInput] = useState(initialCoupon);
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discountPct: number } | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState("");

  // Countdown Timer: 14:59 minutes
  const [timeLeft, setTimeLeft] = useState(14 * 60 + 59);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    const saved = localStorage.getItem("falko_currency");
    if (saved) setCurrency(saved);

    const handleCurrencyChange = (e: any) => {
      if (e.detail) {
        setCurrency(e.detail);
      }
    };

    window.addEventListener("currencyChange", handleCurrencyChange);

    // Fetch user
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setCurrentUser(data.user);
          if (data.user.preferredCurrency && !localStorage.getItem("falko_currency")) {
            setCurrency(data.user.preferredCurrency);
          }

          // Capture abandoned cart lead
          if (productSlug) {
            fetch("/api/checkout/abandoned", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                email: data.user.email,
                name: `${data.user.firstName} ${data.user.lastName}`,
                productSlug,
                refCode,
                currencyCode: data.user.preferredCurrency || "USD",
                amount: 49.0,
              }),
            }).catch(() => {});
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

            if (initialCoupon) {
              validateCouponCode(initialCoupon, data.product.id);
            }
          }
        })
        .finally(() => setLoadingProduct(false));
    } else {
      setLoadingProduct(false);
    }

    return () => window.removeEventListener("currencyChange", handleCurrencyChange);
  }, [productSlug, initialCoupon]);

  const validateCouponCode = async (code: string, pId?: string) => {
    if (!code.trim()) return;
    setCouponLoading(true);
    setCouponError("");

    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim(), productId: pId || product?.id }),
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

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    validateCouponCode(couponCodeInput);
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
      <div className="max-w-md mx-auto my-20 p-8 glass-panel rounded-3xl text-center border border-white/10 shadow-2xl">
        <h3 className="text-base font-bold text-white mb-2">Producto no especificado</h3>
        <p className="text-xs text-slate-400 mb-6">Por favor selecciona un producto desde el marketplace.</p>
        <Link href="/marketplace" className="btn-falcon-primary text-xs py-2.5 px-5 shadow-glow">
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

  // Crypto addresses
  const cryptoWallets = {
    solana: "FALKOvault99x7Q2M4pL1K8Z3wE6sVbNdTjGhY5uR",
    polygon: "0x71C8395B29B1E04C740A10a82B8F2039A4D9F09E",
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      {/* ⏳ Urgency Countdown Timer Bar */}
      <div className="bg-gradient-to-r from-amber-500/20 via-rose-500/20 to-cyan-500/20 border border-amber-500/40 rounded-2xl p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shadow-glow backdrop-blur-xl">
        <div className="flex items-center gap-2 text-amber-300 font-semibold">
          <Clock className="w-4 h-4 text-amber-400 animate-pulse" />
          <span>¡Oferta de precio especial reservada para ti! Completa tu orden antes de que expire el cupo.</span>
        </div>
        <div className="flex items-center gap-2 bg-slate-950/80 px-3 py-1 rounded-xl border border-amber-500/50">
          <span className="text-[10px] uppercase font-bold text-slate-400">Expira en:</span>
          <span className="font-mono font-black text-amber-400 text-sm tracking-wider">
            {formatTimer(timeLeft)}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-heading font-black text-white">
            Checkout Seguro
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Transacción cifrada con garantía incondicional de {product.guaranteeDays} días.
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-emerald-400 font-bold bg-emerald-950/60 px-3 py-1.5 rounded-xl border border-emerald-800/80">
          <ShieldCheck className="w-4 h-4" /> Bóveda Protegida
        </div>
      </div>

      {error && (
        <div className="bg-rose-950/60 border border-rose-800 text-rose-300 text-xs p-4 rounded-xl">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Col: Customer Info, Order Bump & Payment Methods */}
        <div className="lg:col-span-2 space-y-6">
          {/* Buyer Details */}
          <div className="glass-panel rounded-3xl p-6 border border-white/10 shadow-xl">
            <h3 className="text-base font-heading font-bold text-white mb-4">
              1. Datos del Comprador
            </h3>

            {currentUser ? (
              <div className="bg-slate-950/60 border border-white/10 rounded-2xl p-4 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-white block">
                    {currentUser.firstName} {currentUser.lastName}
                  </span>
                  <span className="text-slate-400">{currentUser.email}</span>
                </div>
                <span className="text-xs bg-slate-900 border border-white/10 px-2.5 py-1 rounded-lg text-cyan-400 font-mono">
                  {COUNTRIES[currentUser.countryCode]?.flag} {currentUser.countryCode}
                </span>
              </div>
            ) : (
              <div className="bg-slate-950/60 border border-white/10 rounded-2xl p-4 text-xs text-center space-y-3">
                <p className="text-slate-300">Debes ingresar para asociar la compra a tu cuenta y acceder a la descarga.</p>
                <Link href={`/login?redirect=/checkout?product=${productSlug}`} className="btn-falcon-primary text-xs py-2 px-4 shadow-glow">
                  Iniciar Sesión / Registrarme
                </Link>
              </div>
            )}
          </div>

          {/* ORDER BUMP (Venta Adicional 1-Click) */}
          {product.orderBumpTitle && (
            <div
              onClick={() => setIncludeOrderBump(!includeOrderBump)}
              className={`rounded-3xl p-5 border-2 transition-all cursor-pointer relative overflow-hidden shadow-xl ${
                includeOrderBump
                  ? "bg-amber-950/30 border-amber-500/80 shadow-glow"
                  : "bg-slate-950/70 border-dashed border-amber-500/40 hover:border-amber-400/80"
              }`}
            >
              <div className="flex items-start gap-3.5">
                <input
                  type="checkbox"
                  checked={includeOrderBump}
                  onChange={() => {}}
                  className="w-5 h-5 accent-amber-500 rounded mt-0.5 cursor-pointer shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="text-[10px] uppercase font-black tracking-wider bg-amber-500 text-slate-950 px-2 py-0.5 rounded-full font-mono">
                      🔥 Oferta Exclusiva 1-Click
                    </span>
                    <strong className="text-xs sm:text-sm text-white font-bold">
                      {product.orderBumpTitle}
                    </strong>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {product.orderBumpDescription || "Añade este recurso adicional exclusivo con precio especial."}
                  </p>
                  <span className="text-xs font-mono font-bold text-amber-400 mt-2 block">
                    + {formatCurrency(convertCurrency(product.orderBumpPrice || 0, product.currencyCode, currency), currency)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* PAYMENT METHODS SELECTOR */}
          <div className="glass-panel rounded-3xl p-6 border border-white/10 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-heading font-bold text-white">
                2. Selecciona tu Método de Pago
              </h3>
              <span className="text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-800 px-2.5 py-0.5 rounded-full font-mono font-bold">
                Multi-Divisa & Cripto
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {/* Mercado Pago */}
              <label
                onClick={() => setSelectedMethod("MERCADOPAGO")}
                className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                  selectedMethod === "MERCADOPAGO"
                    ? "bg-cyan-950/50 border-cyan-500 shadow-glow"
                    : "bg-slate-950/60 border-white/10 hover:border-white/20"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-950 border border-blue-500/40 flex items-center justify-center font-bold text-blue-400 text-xs font-mono">
                    MP
                  </div>
                  <div>
                    <strong className="text-white block">Mercado Pago</strong>
                    <span className="text-[10px] text-slate-400">Tarjetas y Cuotas</span>
                  </div>
                </div>
                <div className="w-4 h-4 rounded-full border-2 border-cyan-400 flex items-center justify-center p-0.5">
                  {selectedMethod === "MERCADOPAGO" && <div className="w-2 h-2 rounded-full bg-cyan-400" />}
                </div>
              </label>

              {/* Crypto USDT / USDC */}
              <label
                onClick={() => setSelectedMethod("CRYPTO")}
                className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                  selectedMethod === "CRYPTO"
                    ? "bg-purple-950/50 border-purple-500 shadow-glow"
                    : "bg-slate-950/60 border-white/10 hover:border-white/20"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-purple-950 border border-purple-500/40 flex items-center justify-center font-bold text-purple-300 text-xs">
                    <Coins className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-white block">Cripto (USDT / USDC)</strong>
                    <span className="text-[10px] text-slate-400">Solana & Polygon (0% fee)</span>
                  </div>
                </div>
                <div className="w-4 h-4 rounded-full border-2 border-purple-400 flex items-center justify-center p-0.5">
                  {selectedMethod === "CRYPTO" && <div className="w-2 h-2 rounded-full bg-purple-400" />}
                </div>
              </label>

              {/* PIX Brasil */}
              <label
                onClick={() => setSelectedMethod("PIX")}
                className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                  selectedMethod === "PIX"
                    ? "bg-emerald-950/50 border-emerald-500 shadow-glow"
                    : "bg-slate-950/60 border-white/10 hover:border-white/20"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-950 border border-emerald-500/40 flex items-center justify-center font-bold text-emerald-400 text-xs font-mono">
                    PIX
                  </div>
                  <div>
                    <strong className="text-white block">PIX Brasil 🇧🇷</strong>
                    <span className="text-[10px] text-slate-400">Aprovação Instantânea</span>
                  </div>
                </div>
                <div className="w-4 h-4 rounded-full border-2 border-emerald-400 flex items-center justify-center p-0.5">
                  {selectedMethod === "PIX" && <div className="w-2 h-2 rounded-full bg-emerald-400" />}
                </div>
              </label>

              {/* SPEI México */}
              <label
                onClick={() => setSelectedMethod("SPEI")}
                className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                  selectedMethod === "SPEI"
                    ? "bg-cyan-950/50 border-cyan-500 shadow-glow"
                    : "bg-slate-950/60 border-white/10 hover:border-white/20"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-cyan-950 border border-cyan-500/40 flex items-center justify-center font-bold text-cyan-400 text-xs font-mono">
                    SPEI
                  </div>
                  <div>
                    <strong className="text-white block">SPEI México 🇲🇽</strong>
                    <span className="text-[10px] text-slate-400">Transferencia CLABE</span>
                  </div>
                </div>
                <div className="w-4 h-4 rounded-full border-2 border-cyan-400 flex items-center justify-center p-0.5">
                  {selectedMethod === "SPEI" && <div className="w-2 h-2 rounded-full bg-cyan-400" />}
                </div>
              </label>

              {/* PSE Colombia */}
              <label
                onClick={() => setSelectedMethod("PSE")}
                className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                  selectedMethod === "PSE"
                    ? "bg-amber-950/50 border-amber-500 shadow-glow"
                    : "bg-slate-950/60 border-white/10 hover:border-white/20"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-950 border border-amber-500/40 flex items-center justify-center font-bold text-amber-400 text-xs font-mono">
                    PSE
                  </div>
                  <div>
                    <strong className="text-white block">PSE Colombia 🇨🇴</strong>
                    <span className="text-[10px] text-slate-400">Débito en Línea</span>
                  </div>
                </div>
                <div className="w-4 h-4 rounded-full border-2 border-amber-400 flex items-center justify-center p-0.5">
                  {selectedMethod === "PSE" && <div className="w-2 h-2 rounded-full bg-amber-400" />}
                </div>
              </label>

              {/* BROU / Prex Uruguay */}
              <label
                onClick={() => setSelectedMethod("BROU_PREX")}
                className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                  selectedMethod === "BROU_PREX"
                    ? "bg-cyan-950/50 border-cyan-500 shadow-glow"
                    : "bg-slate-950/60 border-white/10 hover:border-white/20"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-slate-900 border border-cyan-500/40 flex items-center justify-center font-bold text-cyan-300 text-xs font-mono">
                    UY
                  </div>
                  <div>
                    <strong className="text-white block">Prex / BROU 🇺🇾</strong>
                    <span className="text-[10px] text-slate-400">Transferencia Bancaria Local</span>
                  </div>
                </div>
                <div className="w-4 h-4 rounded-full border-2 border-cyan-400 flex items-center justify-center p-0.5">
                  {selectedMethod === "BROU_PREX" && <div className="w-2 h-2 rounded-full bg-cyan-400" />}
                </div>
              </label>
            </div>

            {/* Crypto Details Box when selected */}
            {selectedMethod === "CRYPTO" && (
              <div className="bg-purple-950/30 border border-purple-800/60 rounded-2xl p-4 space-y-3 mt-3 animate-in fade-in duration-150">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                    <QrCode className="w-4 h-4" /> Billetera de Recepción Cripto FALKO
                  </span>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => setCryptoNetwork("solana")}
                      className={`text-[10px] font-bold px-2 py-1 rounded-lg ${
                        cryptoNetwork === "solana"
                          ? "bg-purple-500 text-white shadow-sm"
                          : "bg-slate-900 text-slate-400"
                      }`}
                    >
                      Solana (USDC/USDT)
                    </button>
                    <button
                      type="button"
                      onClick={() => setCryptoNetwork("polygon")}
                      className={`text-[10px] font-bold px-2 py-1 rounded-lg ${
                        cryptoNetwork === "polygon"
                          ? "bg-purple-500 text-white shadow-sm"
                          : "bg-slate-900 text-slate-400"
                      }`}
                    >
                      Polygon (USDT/USDC)
                    </button>
                  </div>
                </div>

                <div className="bg-slate-950/80 p-3 rounded-xl border border-white/10 flex items-center justify-between gap-2 text-xs">
                  <span className="font-mono text-[11px] text-slate-300 truncate">
                    {cryptoWallets[cryptoNetwork]}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(cryptoWallets[cryptoNetwork]);
                      setCopiedCrypto(true);
                      setTimeout(() => setCopiedCrypto(false), 2000);
                    }}
                    className="btn-falcon-primary text-[10px] py-1 px-2.5 shrink-0"
                  >
                    {copiedCrypto ? <Check className="w-3 h-3 text-black" /> : <Copy className="w-3 h-3 text-black" />}
                    {copiedCrypto ? "Copiada" : "Copiar"}
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  Envía exactamente el equivalente a <strong>{formatCurrency(finalTotal, "USD")}</strong>. La confirmación y entrega de tus archivos se activa automáticamente al confirmar la orden.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Order Summary, Coupons & Guarantee */}
        <div className="space-y-6">
          <div className="glass-panel rounded-3xl p-6 border border-white/10 shadow-glow">
            <h3 className="text-base font-heading font-bold text-white mb-4 pb-3 border-b border-white/10">
              Resumen de la Orden
            </h3>

            {/* Product Mini Card */}
            <div className="flex items-center gap-3 mb-5">
              <div className="w-14 h-14 rounded-2xl bg-slate-900 overflow-hidden border border-white/10 shrink-0">
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
                <div className="bg-emerald-950/40 border border-emerald-500/60 p-3 rounded-2xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-emerald-400" />
                    <span className="font-bold text-white font-mono">{appliedCoupon.code}</span>
                    <span className="text-emerald-400 font-semibold">(-{appliedCoupon.discountPct}%)</span>
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
                      className="w-full px-3.5 py-2 rounded-xl glass-input text-xs font-mono"
                    />
                    <button
                      type="submit"
                      disabled={couponLoading || !couponCodeInput.trim()}
                      className="btn-falcon-secondary text-xs px-3.5 py-2 shrink-0"
                    >
                      {couponLoading ? "..." : "Aplicar"}
                    </button>
                  </div>
                  {couponError && <p className="text-[10px] text-rose-400">{couponError}</p>}
                </form>
              )}
            </div>

            {/* Guarantee Callout */}
            <div className="bg-emerald-950/40 border border-emerald-800/80 rounded-2xl p-3 mb-5 flex items-center gap-2 text-emerald-300 text-xs">
              <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>Garantía {product.guaranteeDays} días respaldada por FALKO.</span>
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
                <span>Tarifa de Plataforma</span>
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
              {processing ? "Confirmando Orden Segura..." : `Completar Pago (${formatCurrency(finalTotal, currency)})`}
            </button>

            <p className="text-[10px] text-slate-400 text-center mt-3 flex items-center justify-center gap-1">
              <Lock className="w-3 h-3 text-cyan-400" />
              Descarga digital instantánea disponible tras confirmación
            </p>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Bottom CTA */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#05070e]/95 backdrop-blur-2xl border-t border-cyan-500/30 p-3.5 shadow-2xl safe-bottom">
        <div className="flex items-center justify-between gap-3 max-w-md mx-auto">
          <div>
            <span className="text-[10px] text-slate-400 block">Total a pagar</span>
            <span className="text-base font-black font-mono text-cyan-400">
              {formatCurrency(finalTotal, currency)}
            </span>
          </div>
          <button
            onClick={handleCompleteOrder}
            disabled={processing || !currentUser}
            className="btn-falcon-primary py-2.5 px-5 text-xs font-bold shadow-glow disabled:opacity-50 flex items-center gap-1.5"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>{processing ? "Procesando..." : "Completar Pago"}</span>
          </button>
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
