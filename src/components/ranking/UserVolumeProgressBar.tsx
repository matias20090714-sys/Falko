"use client";

import React, { useState } from "react";
import { MilestoneTier, RANKING_TIERS } from "@/lib/ranking-types";
import { Award, ChevronRight, Info, ShieldCheck, Sparkles, TrendingUp, Trophy } from "lucide-react";
import Link from "next/link";

interface UserVolumeProgressBarProps {
  currentVolume: number;
  currentTier: MilestoneTier;
  nextTier: MilestoneTier | null;
  nextMilestoneUsd: number | null;
  remainingUsd: number;
  progressPercent: number;
  rankPosition?: number;
  compact?: boolean;
}

export function UserVolumeProgressBar({
  currentVolume,
  currentTier,
  nextTier,
  nextMilestoneUsd,
  remainingUsd,
  progressPercent,
  rankPosition = 0,
  compact = false,
}: UserVolumeProgressBarProps) {
  const [showTiersModal, setShowTiersModal] = useState(false);

  if (compact) {
    return (
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 shadow-md">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <div className="flex items-center gap-1.5">
            <span className="text-base">{currentTier.badge}</span>
            <span className="font-bold text-white">{currentTier.name}</span>
            {rankPosition > 0 && (
              <span className="text-[10px] bg-cyan-950 text-cyan-400 border border-cyan-800/60 px-1.5 py-0.5 rounded font-mono">
                #{rankPosition}
              </span>
            )}
          </div>
          <span className="font-mono font-bold text-cyan-400">
            ${currentVolume.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800 relative">
          <div
            className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full rounded-full transition-all duration-700 relative"
            style={{ width: `${progressPercent}%` }}
          >
            <div className="absolute right-0 top-0 bottom-0 w-2 bg-white/60 blur-[1px] animate-pulse" />
          </div>
        </div>

        {nextTier && (
          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1.5">
            <span>Faltan <strong className="text-white font-mono">${remainingUsd.toLocaleString()} USD</strong></span>
            <span className="text-slate-500">Siguiente: {nextTier.badge} {nextTier.name}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden glass-panel rounded-2xl p-5 md:p-6 border border-slate-800/80 shadow-glow">
      {/* Ambient background glow */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10">
        {/* Header with Title & Rank Position */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 flex items-center justify-center text-2xl shadow-inner">
              {currentTier.badge}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-bold tracking-wider text-cyan-400">
                  Tu Nivel de Ventas FALKO
                </span>
                {rankPosition > 0 && (
                  <span className="text-xs bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 rounded-full font-mono font-bold">
                    Puesto #{rankPosition} Global
                  </span>
                )}
              </div>
              <h3 className="text-xl font-heading font-black text-white flex items-center gap-2">
                {currentTier.name}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowTiersModal(true)}
              className="text-xs bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all"
            >
              <Info className="w-3.5 h-3.5 text-cyan-400" />
              Ver Escala de Hitos
            </button>
            <Link
              href="/ranking"
              className="text-xs bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all"
            >
              <Trophy className="w-3.5 h-3.5" />
              Ranking Global
            </Link>
          </div>
        </div>

        {/* Sales Volume Metric Callout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5">
            <span className="text-xs text-slate-400 block mb-1">Volumen Total Generado</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black font-mono text-white">
                ${currentVolume.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className="text-xs font-semibold text-cyan-400 font-mono">USD</span>
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5">
            <span className="text-xs text-slate-400 block mb-1">Próximo Hito</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black font-mono text-amber-400">
                {nextMilestoneUsd ? `$${nextMilestoneUsd.toLocaleString()} USD` : "¡Nivel Máximo!"}
              </span>
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5">
            <span className="text-xs text-slate-400 block mb-1">Faltante para Subir</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black font-mono text-emerald-400">
                {nextMilestoneUsd ? `$${remainingUsd.toLocaleString("en-US", { minimumFractionDigits: 2 })} USD` : "$0.00"}
              </span>
            </div>
          </div>
        </div>

        {/* Visual Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-slate-300">
            <span className="font-semibold flex items-center gap-1 text-slate-400">
              <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
              Progreso hacia {nextTier ? `${nextTier.badge} ${nextTier.name}` : "Apex"}
            </span>
            <span className="font-mono font-bold text-cyan-400">{progressPercent}% completado</span>
          </div>

          <div className="w-full bg-slate-950/80 rounded-full h-3.5 p-0.5 overflow-hidden border border-slate-800 relative">
            <div
              className="bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 h-full rounded-full transition-all duration-1000 relative shadow-glow"
              style={{ width: `${progressPercent}%` }}
            >
              <div className="absolute right-0 top-0 bottom-0 w-3 bg-white/80 blur-[2px] animate-pulse" />
            </div>
          </div>

          <div className="flex justify-between text-[11px] text-slate-500">
            <span>${currentTier.minUsd.toLocaleString()} USD ({currentTier.name})</span>
            {nextMilestoneUsd && <span>${nextMilestoneUsd.toLocaleString()} USD ({nextTier?.name})</span>}
          </div>
        </div>
      </div>

      {/* Tiers Information Modal */}
      {showTiersModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-cyan-400" />
                <h4 className="text-lg font-heading font-bold text-white">Escala de Hitos FALKO</h4>
              </div>
              <button
                onClick={() => setShowTiersModal(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-400 mb-4">
              El ranking mide el <strong>volumen de ventas total generado en USD</strong> tanto para creadores como para afiliados. Al subir de nivel desbloqueas mayor reputación e insignias exclusivas.
            </p>

            <div className="space-y-3">
              {RANKING_TIERS.map((tier) => {
                const isCurrent = tier.id === currentTier.id;
                return (
                  <div
                    key={tier.id}
                    className={`p-3.5 rounded-xl border transition-all ${
                      isCurrent
                        ? "bg-cyan-950/40 border-cyan-500/50 shadow-glow"
                        : "bg-slate-950/50 border-slate-800"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{tier.badge}</span>
                        <span className="font-bold text-sm text-white">{tier.name}</span>
                        {isCurrent && (
                          <span className="text-[10px] bg-cyan-500 text-slate-950 px-2 py-0.5 rounded-full font-bold">
                            Tu Nivel Actual
                          </span>
                        )}
                      </div>
                      <span className="font-mono text-xs font-bold text-cyan-400">
                        ${tier.minUsd.toLocaleString()} USD+
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">{tier.description}</p>
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => setShowTiersModal(false)}
              className="mt-6 w-full btn-falcon-secondary py-2 text-sm justify-center"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
