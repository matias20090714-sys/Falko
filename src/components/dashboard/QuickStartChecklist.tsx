"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Check,
  CheckCircle2,
  Circle,
  PlusCircle,
  Wallet,
  Share2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Smartphone,
  ChevronRight,
} from "lucide-react";

interface QuickStartChecklistProps {
  user: any;
  hasProducts: boolean;
  hasWalletSetup: boolean;
}

export function QuickStartChecklist({ user, hasProducts, hasWalletSetup }: QuickStartChecklistProps) {
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>({
    step1: hasProducts,
    step2: hasWalletSetup,
    step3: false,
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem(`falko_checklist_${user?.id || "guest"}`);
      if (saved) {
        setCompletedSteps(JSON.parse(saved));
      } else {
        setCompletedSteps({
          step1: hasProducts,
          step2: hasWalletSetup,
          step3: false,
        });
      }
    } catch {}
  }, [user, hasProducts, hasWalletSetup]);

  const toggleStep = (key: string) => {
    const updated = { ...completedSteps, [key]: !completedSteps[key] };
    setCompletedSteps(updated);
    localStorage.setItem(`falko_checklist_${user?.id || "guest"}`, JSON.stringify(updated));
  };

  const stepsCount = 3;
  const completedCount = Object.values(completedSteps).filter(Boolean).length;
  const progressPct = Math.round((completedCount / stepsCount) * 100);

  return (
    <div className="glass-panel p-6 sm:p-7 rounded-3xl border border-cyan-500/30 bg-gradient-to-r from-cyan-950/20 via-slate-950 to-slate-950 shadow-xl space-y-5">
      {/* Header & Progress Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs uppercase font-mono font-bold text-cyan-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              Ruta hacia tu primera venta
            </span>
            <span className="text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-800 px-2 py-0.5 rounded-full font-mono font-bold">
              {progressPct}% COMPLETADO
            </span>
          </div>
          <h3 className="text-lg font-bold text-white">
            3 Pasos Fáciles para Facturar con FALKO
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Sigue estos pasos guiados para configurar tu catálogo y recibir cobros internacionales.
          </p>
        </div>

        {/* Progress Bar Container */}
        <div className="w-full sm:w-48 space-y-1.5">
          <div className="flex justify-between text-[11px] font-mono">
            <span className="text-slate-400">{completedCount} de {stepsCount} completados</span>
            <span className="text-cyan-400 font-bold">{progressPct}%</span>
          </div>
          <div className="h-2.5 w-full bg-slate-900 rounded-full overflow-hidden border border-white/10 p-0.5">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 rounded-full transition-all duration-500 shadow-glow"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* 3 Step Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        {/* Step 1: Subir Producto */}
        <div
          className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
            completedSteps.step1
              ? "bg-slate-900/60 border-emerald-500/40 text-emerald-300"
              : "bg-slate-950/70 border-white/10 text-white hover:border-cyan-500/40"
          }`}
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                Paso 1
              </span>
              <button
                type="button"
                onClick={() => toggleStep("step1")}
                className="p-1 text-slate-400 hover:text-emerald-400"
                title="Marcar como completado"
              >
                {completedSteps.step1 ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Circle className="w-4 h-4" />
                )}
              </button>
            </div>
            <h4 className="text-xs font-bold text-white">Sube tu primer producto digital</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Usa el asistente rápido en 3 pasos para ponerle precio y portadas.
            </p>
          </div>

          <div className="pt-3 mt-3 border-t border-white/5">
            <Link
              href="/seller/products/new"
              className="btn-falcon-primary text-[11px] py-1.5 px-3 w-full justify-center"
            >
              <PlusCircle className="w-3 h-3" />
              <span>{completedSteps.step1 ? "Subir Otro Producto" : "Publicar Ahora"}</span>
            </Link>
          </div>
        </div>

        {/* Step 2: Método de Cobro */}
        <div
          className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
            completedSteps.step2
              ? "bg-slate-900/60 border-emerald-500/40 text-emerald-300"
              : "bg-slate-950/70 border-white/10 text-white hover:border-cyan-500/40"
          }`}
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                Paso 2
              </span>
              <button
                type="button"
                onClick={() => toggleStep("step2")}
                className="p-1 text-slate-400 hover:text-emerald-400"
                title="Marcar como completado"
              >
                {completedSteps.step2 ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Circle className="w-4 h-4" />
                )}
              </button>
            </div>
            <h4 className="text-xs font-bold text-white">Revisa tu Billetera y Retiros</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Verifica los métodos locales de tu país (BROU, Prex, CBU, SPEI, USDT).
            </p>
          </div>

          <div className="pt-3 mt-3 border-t border-white/5">
            <Link
              href="/wallet"
              className="btn-falcon-secondary text-[11px] py-1.5 px-3 w-full justify-center text-slate-300"
            >
              <Wallet className="w-3 h-3 text-amber-400" />
              <span>Ver Mi Billetera</span>
            </Link>
          </div>
        </div>

        {/* Step 3: Compartir Link / Activar Afiliados */}
        <div
          className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
            completedSteps.step3
              ? "bg-slate-900/60 border-emerald-500/40 text-emerald-300"
              : "bg-slate-950/70 border-white/10 text-white hover:border-cyan-500/40"
          }`}
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                Paso 3
              </span>
              <button
                type="button"
                onClick={() => toggleStep("step3")}
                className="p-1 text-slate-400 hover:text-emerald-400"
                title="Marcar como completado"
              >
                {completedSteps.step3 ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Circle className="w-4 h-4" />
                )}
              </button>
            </div>
            <h4 className="text-xs font-bold text-white">Comparte tu Link o Activa Afiliados</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Envía tu enlace por WhatsApp o deja que promotores vendan por ti.
            </p>
          </div>

          <div className="pt-3 mt-3 border-t border-white/5">
            <Link
              href="/seller"
              className="btn-falcon-secondary text-[11px] py-1.5 px-3 w-full justify-center text-purple-300 border-purple-800/60"
            >
              <Share2 className="w-3 h-3 text-purple-400" />
              <span>Mis Productos & Links</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
