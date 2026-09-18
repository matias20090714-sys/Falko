"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Sparkles,
  ShoppingBag,
  Share2,
  Package,
  ArrowRight,
  X,
  Zap,
  ShieldCheck,
  Rocket,
} from "lucide-react";

interface WelcomeOnboardingModalProps {
  user: any;
}

export function WelcomeOnboardingModal({ user }: WelcomeOnboardingModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    const key = `falko_onboarding_seen_${user.id}`;
    const globalKey = "falko_onboarding_shown";
    const alreadySeen = localStorage.getItem(key) || localStorage.getItem(globalKey) || localStorage.getItem(`falko_onboarding_dismissed_${user.id}`);

    if (!alreadySeen) {
      setIsOpen(true);
      // Auto-mark as seen immediately so it never triggers again
      localStorage.setItem(key, "true");
      localStorage.setItem(globalKey, "true");
    }
  }, [user]);

  const handleDismiss = () => {
    if (user) {
      localStorage.setItem(`falko_onboarding_seen_${user.id}`, "true");
      localStorage.setItem(`falko_onboarding_dismissed_${user.id}`, "true");
    }
    localStorage.setItem("falko_onboarding_shown", "true");
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-[#05070e] border border-cyan-500/40 rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl shadow-cyan-500/10 space-y-6 relative overflow-hidden">
        {/* Ambient Glow */}
        <div className="absolute -top-20 -right-20 w-60 h-60 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs font-bold font-mono mb-2 shadow-glow">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span>GUÍA DE INICIO RÁPIDO EN 60 SEGUNDOS</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-heading font-black text-white">
              ¡Bienvenido a FALKO, {user?.firstName}! 🦅
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              ¿Cuál es tu objetivo principal hoy en la plataforma?
            </p>
          </div>
          <button
            type="button"
            onClick={handleDismiss}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 3 Main Onboarding Paths */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Path 1: Vender un Producto */}
          <Link
            href="/seller/products/new"
            onClick={handleDismiss}
            className="glass-panel p-5 rounded-2xl border border-cyan-500/30 hover:border-cyan-400 bg-slate-900/40 hover:bg-slate-900/90 text-left transition-all group flex flex-col justify-between hover:scale-[1.02] shadow-sm hover:shadow-cyan-500/10"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400 mb-3 group-hover:bg-cyan-500 group-hover:text-slate-950 transition-colors">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-wider block mb-1">
                Soy Creador
              </span>
              <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                Subir Mi Producto
              </h3>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                Publica un curso, ebook, software o plantilla en 3 pasos fáciles.
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-cyan-400 font-bold">
              <span>Comenzar</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Path 2: Ganar como Afiliado */}
          <Link
            href="/affiliate/products"
            onClick={handleDismiss}
            className="glass-panel p-5 rounded-2xl border border-purple-500/30 hover:border-purple-400 bg-slate-900/40 hover:bg-slate-900/90 text-left transition-all group flex flex-col justify-between hover:scale-[1.02] shadow-sm hover:shadow-purple-500/10"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-purple-950 border border-purple-500/40 flex items-center justify-center text-purple-400 mb-3 group-hover:bg-purple-500 group-hover:text-slate-950 transition-colors">
                <Share2 className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono font-bold text-purple-400 uppercase tracking-wider block mb-1">
                Soy Afiliado
              </span>
              <h3 className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors">
                Ganar Comisiones
              </h3>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                Elige productos con hasta 80% de comisión y promociona tu link.
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-purple-400 font-bold">
              <span>Ver Catálogo</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Path 3: Comprar / Aprender */}
          <Link
            href="/marketplace"
            onClick={handleDismiss}
            className="glass-panel p-5 rounded-2xl border border-emerald-500/30 hover:border-emerald-400 bg-slate-900/40 hover:bg-slate-900/90 text-left transition-all group flex flex-col justify-between hover:scale-[1.02] shadow-sm hover:shadow-emerald-500/10"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mb-3 group-hover:bg-emerald-500 group-hover:text-slate-950 transition-colors">
                <Package className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider block mb-1">
                Comprador
              </span>
              <h3 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
                Explorar Mercado
              </h3>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                Descarga herramientas y cursos con garantía protegida de 7 a 30 días.
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-emerald-400 font-bold">
              <span>Explorar</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>

        {/* Footer Note */}
        <div className="pt-2 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1.5 text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            Cuentas 100% gratuitas sin mensualidades fijas.
          </span>
          <button
            type="button"
            onClick={handleDismiss}
            className="text-slate-400 hover:text-white underline text-xs"
          >
            Ir directamente a mi panel &rarr;
          </button>
        </div>
      </div>
    </div>
  );
}
