"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { formatCurrency, convertCurrency, COUNTRIES } from "@/lib/currency";
import { FalconLogo } from "@/components/layout/FalconLogo";
import {
  ArrowRight,
  CheckCircle2,
  CreditCard,
  Lock,
  Percent,
  ShieldCheck,
  Sparkles,
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
          }
        })
        .finally(() => setLoadingProduct(false));
    } else {
      setLoadingProduct(false);
    }
  }, [productSlug]);

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

  const convertedPrice = convertCurrency(product.price, product.currencyCode, currency);

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
        {/* Left Col: Customer Info & Payment Method */}
        <div className="lg:col-span-2 space-y-6">
          {/* Buyer Details */}
          <div className="glass-panel rounded-2xl p-6 border border-slate-800">
            <h3 className="text-base font-heading font-bold text-white mb-4">
              1. Datos del Comprador
            </h3>

            {currentUser ? (
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-white block">
                    {currentUser.firstName} {currentUser.lastName}
                  </span>
                  <span className="text-slate-400">{currentUser.email}</span>
                </div>
                <span className="text-xs bg-slate-900 border border-slate-700 px-2.5 py-1 rounded-md text-cyan-400 font-mono">
                  {COUNTRIES[currentUser.countryCode]?.flag} {currentUser.countryCode}
                </span>
              </div>
            ) : (
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 text-xs text-center space-y-3">
                <p className="text-slate-300">Debes tener una cuenta FALKO para registrar la compra y acceder a las descargas.</p>
                <Link href={`/login?redirect=/checkout?product=${productSlug}`} className="btn-falcon-primary text-xs py-2 px-4">
                  Iniciar Sesión / Registrarme
                </Link>
              </div>
            )}
          </div>

          {/* Payment Method Selector */}
          <div className="glass-panel rounded-2xl p-6 border border-slate-800">
            <h3 className="text-base font-heading font-bold text-white mb-4 flex items-center justify-between">
              <span>2. Método de Pago</span>
              <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded font-mono font-bold">
                ✓ Mercado Pago Activo
              </span>
            </h3>

            <div className="space-y-3">
              {/* Option 1: Mercado Pago Oficial */}
              <label
                onClick={() => setSelectedMethod("MERCADOPAGO")}
                className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                  selectedMethod === "MERCADOPAGO"
                    ? "bg-cyan-950/40 border-cyan-500/60 shadow-glow"
                    : "bg-slate-950/60 border-slate-800 hover:border-slate-700"
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
                      Pasarela oficial con acreditación y garantía inmediata
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
                    : "bg-slate-950/60 border-slate-800 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center gap-3">
                  <CreditCard className="w-5 h-5 text-cyan-400" />
                  <div>
                    <span className="text-xs font-bold text-white block">
                      Pago de Prueba / Modo Simulación Rápido
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Entrega instantánea para testeo del marketplace
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

        {/* Right Col: Order Summary & Guarantee Badge */}
        <div className="space-y-6">
          <div className="glass-panel rounded-2xl p-6 border border-slate-800 shadow-glow">
            <h3 className="text-base font-heading font-bold text-white mb-4 pb-3 border-b border-slate-800">
              Resumen de la Orden
            </h3>

            {/* Product Mini Card */}
            <div className="flex items-center gap-3 mb-5">
              <div className="w-14 h-14 rounded-xl bg-slate-900 overflow-hidden border border-slate-800 shrink-0">
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
                  Referido por afiliado:
                </span>
                <span className="font-mono font-bold text-[11px] bg-purple-900/60 px-2 py-0.5 rounded">
                  {refCode}
                </span>
              </div>
            )}

            {/* Line items */}
            <div className="space-y-2.5 text-xs text-slate-300 pt-2 border-t border-slate-800 mb-6">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-mono">{formatCurrency(convertedPrice, currency)}</span>
              </div>
              <div className="flex justify-between text-emerald-400">
                <span>Comisión de Plataforma</span>
                <span className="font-mono">Incluida</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-white pt-3 border-t border-slate-800">
                <span>Total a Pagar</span>
                <span className="font-mono text-cyan-400 text-base">
                  {formatCurrency(convertedPrice, currency)}
                </span>
              </div>
            </div>

            {/* Pay Button */}
            <button
              onClick={handleCompleteOrder}
              disabled={processing || !currentUser}
              className="w-full btn-falcon-primary py-3.5 text-sm font-bold justify-center shadow-glow disabled:opacity-50"
            >
              <Zap className="w-4 h-4" />
              {processing ? "Procesando Pago Seguro..." : "Confirmar y Pagar Orden"}
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
