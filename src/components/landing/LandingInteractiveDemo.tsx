"use client";

import React, { useState } from "react";
import {
  Sparkles,
  ShieldCheck,
  Zap,
  Lock,
  QrCode,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  Coins,
  Package,
  Share2,
} from "lucide-react";
import { formatCurrency } from "@/lib/currency";

export function LandingInteractiveDemo() {
  const [activeTab, setActiveTab] = useState<"checkout" | "vault" | "affiliate">("checkout");
  const [selectedMethod, setSelectedMethod] = useState("USDT");

  return (
    <div className="w-full max-w-5xl mx-auto my-16">
      {/* Demo Container Glass Frame */}
      <div className="glass-panel p-2 sm:p-4 rounded-3xl border border-white/10 bg-slate-950/80 shadow-2xl relative overflow-hidden">
        {/* Glow ambient background inside frame */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />

        {/* Demo Header Bar with interactive tabs */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-b border-white/5 bg-slate-900/50 rounded-2xl">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <span className="w-3 h-3 rounded-full bg-rose-500/80" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
            </div>
            <span className="text-xs font-mono font-bold text-slate-400 ml-2">
              falko.dpdns.org/live-engine
            </span>
          </div>

          <div className="flex items-center bg-slate-950/80 p-1 rounded-xl border border-white/10">
            <button
              onClick={() => setActiveTab("checkout")}
              className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${
                activeTab === "checkout"
                  ? "bg-cyan-950 text-cyan-300 border border-cyan-500/40 shadow-glow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              ⚡ Checkout Ultrarrápido
            </button>
            <button
              onClick={() => setActiveTab("vault")}
              className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${
                activeTab === "vault"
                  ? "bg-cyan-950 text-cyan-300 border border-cyan-500/40 shadow-glow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              🔒 Bóveda & Entrega
            </button>
            <button
              onClick={() => setActiveTab("affiliate")}
              className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${
                activeTab === "affiliate"
                  ? "bg-cyan-950 text-cyan-300 border border-cyan-500/40 shadow-glow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              🤝 Red de Afiliados
            </button>
          </div>
        </div>

        {/* Tab 1: Live Checkout Preview */}
        {activeTab === "checkout" && (
          <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-center animate-in fade-in duration-200">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-[11px] font-mono font-bold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Conversión Optimizada en Móvil</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-heading font-black text-white">
                El checkout con menos fricción de Latinoamérica
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Tus compradores pagan en 1 clic con <strong>Mercado Pago, Cripto USDT en Solana/Polygon (0% fee), PIX Brasil, SPEI México o PSE Colombia</strong>.
              </p>

              <div className="space-y-2 pt-2 text-xs">
                <div className="flex items-center gap-2 text-slate-200">
                  <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>Garantía protegida automática de 7 a 30 días.</span>
                </div>
                <div className="flex items-center gap-2 text-slate-200">
                  <Zap className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Acreditación de fondos al creador con tarifa fija de 25 UYU.</span>
                </div>
              </div>
            </div>

            {/* Interactive Miniature Card */}
            <div className="bg-slate-900/90 border border-cyan-500/30 rounded-2xl p-5 space-y-4 shadow-glow">
              <div className="flex items-center justify-between pb-3 border-b border-white/5 text-xs">
                <span className="font-bold text-white">Demo: SaaS Boilerplate Pro</span>
                <span className="font-extrabold text-cyan-400 text-sm">$49.00 USD</span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {["USDT", "MERCADOPAGO", "PIX / SPEI"].map((method) => (
                  <button
                    key={method}
                    onClick={() => setSelectedMethod(method)}
                    className={`py-2 px-1 rounded-xl text-[11px] font-bold border transition-all text-center ${
                      selectedMethod === method
                        ? "bg-cyan-950 text-cyan-300 border-cyan-400 shadow-glow"
                        : "bg-slate-950 text-slate-400 border-white/10 hover:text-white"
                    }`}
                  >
                    {method}
                  </button>
                ))}
              </div>

              <div className="bg-slate-950/80 p-3 rounded-xl border border-white/5 space-y-2 text-xs">
                <div className="flex justify-between text-slate-400 text-[11px]">
                  <span>Medio seleccionado:</span>
                  <span className="font-bold text-cyan-400">{selectedMethod}</span>
                </div>
                <div className="flex justify-between text-slate-300 font-bold">
                  <span>Total a Pagar:</span>
                  <span className="text-emerald-400 font-extrabold">$49.00 USD</span>
                </div>
              </div>

              <div className="btn-falcon-primary w-full py-2.5 text-xs font-bold text-center flex items-center justify-center gap-2">
                <Lock className="w-3.5 h-3.5" />
                <span>Pagar con Garantía Protegida</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Vault & Instant Deliverables */}
        {activeTab === "vault" && (
          <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-center animate-in fade-in duration-200">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-950/80 border border-purple-500/40 text-purple-300 text-[11px] font-bold">
                <Lock className="w-3.5 h-3.5 text-purple-400" />
                <span>Cifrado de Alta Seguridad</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-heading font-black text-white">
                Bóveda Digital Anti-Piratería
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Tus archivos ZIP, cursos en video y enlaces de Notion/Drive se entregan mediante enlaces firmados con expiración temporal para proteger tu propiedad intelectual.
              </p>
            </div>

            <div className="bg-slate-900/90 border border-purple-500/30 rounded-2xl p-5 space-y-3 shadow-glow">
              <span className="text-[10px] uppercase text-purple-300 font-bold block">
                📦 Biblioteca del Comprador
              </span>
              <div className="space-y-2 text-xs">
                <div className="p-3 rounded-xl bg-slate-950 border border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-purple-400" />
                    <span className="text-white font-semibold truncate">paquete_master_completo.zip</span>
                  </div>
                  <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800 font-bold">
                    Token Activo
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Affiliate Army */}
        {activeTab === "affiliate" && (
          <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-center animate-in fade-in duration-200">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-[11px] font-bold">
                <Share2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>Multiplica tus Ventas en Piloto Automático</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-heading font-black text-white">
                Recluta un ejército de afiliados
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Define hasta el 80% de comisión. FALKO divide los pagos y acredita las ganancias a tus promotores al instante en cada compra generada.
              </p>
            </div>

            <div className="bg-slate-900/90 border border-cyan-500/30 rounded-2xl p-5 space-y-3 shadow-glow text-xs">
              <div className="flex justify-between items-center text-slate-300">
                <span>Tu Producto ($50.00 USD):</span>
                <span className="text-white font-bold">Comisión Afiliado 40%</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-white/5 flex justify-between font-bold">
                <span className="text-emerald-400">Afiliado gana: +$20.00 USD</span>
                <span className="text-cyan-400">Tú ganas: +$29.37 USD</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
