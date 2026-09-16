"use client";

import React, { useState } from "react";
import { MilestoneTier, RANKING_TIERS } from "@/lib/ranking-types";
import { CheckCircle2, ChevronDown, ChevronUp, Lock, Sparkles, TrendingUp, Trophy, Zap } from "lucide-react";

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
  compact = false,
}: UserVolumeProgressBarProps) {
  const [showAllRanks, setShowAllRanks] = useState(false);

  if (compact) {
    return (
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 shadow-md">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <div className="flex items-center gap-1.5">
            <span className="text-base">{currentTier.badge}</span>
            <span className="font-bold text-white">{currentTier.name}</span>
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
            <span>Faltan <strong className="text-white font-mono">${remainingUsd.toLocaleString("en-US", { minimumFractionDigits: 2 })} USD</strong></span>
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
        {/* Header with Title & Current Tier */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 flex items-center justify-center text-3xl shadow-inner">
              {currentTier.badge}
            </div>
            <div>
              <span className="text-xs uppercase font-bold tracking-wider text-cyan-400 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-cyan-400" />
                Tu Nivel de Ventas en FALKO
              </span>
              <h3 className="text-2xl font-heading font-black text-white mt-0.5">
                {currentTier.name}
              </h3>
            </div>
          </div>

          <button
            onClick={() => setShowAllRanks(!showAllRanks)}
            className="text-xs bg-slate-800/90 hover:bg-slate-700 text-slate-300 border border-slate-700 px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all self-start sm:self-auto"
          >
            <span>{showAllRanks ? "Ocultar Escala de Rangos" : "Ver Cuánto Falta para Cada Rango"}</span>
            {showAllRanks ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* 3 Main Stat Cards: Ganado, Próximo Hito, Faltante */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mb-5">
          {/* 1. Ganancias / Volumen Generado */}
          <div className="bg-slate-950/70 border border-slate-800/90 rounded-2xl p-4">
            <span className="text-xs text-slate-400 block mb-1">Total Generado en Ventas</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-black font-mono text-cyan-400">
                ${currentVolume.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className="text-xs font-semibold text-slate-500 font-mono">USD</span>
            </div>
          </div>

          {/* 2. Próximo Rango */}
          <div className="bg-slate-950/70 border border-slate-800/90 rounded-2xl p-4">
            <span className="text-xs text-slate-400 block mb-1">Próximo Rango</span>
            <div className="flex items-center gap-2">
              <span className="text-2xl">{nextTier ? nextTier.badge : "👑"}</span>
              <div>
                <p className="text-base font-bold text-white truncate">
                  {nextTier ? nextTier.name : "Nivel Máximo"}
                </p>
                <p className="text-xs text-amber-400 font-mono font-semibold">
                  {nextMilestoneUsd ? `Meta: $${nextMilestoneUsd.toLocaleString()} USD` : "¡Completado!"}
                </p>
              </div>
            </div>
          </div>

          {/* 3. Faltante para Subir */}
          <div className="bg-slate-950/70 border border-slate-800/90 rounded-2xl p-4">
            <span className="text-xs text-slate-400 block mb-1">Faltante para Subir</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-black font-mono text-emerald-400">
                {nextMilestoneUsd ? `$${remainingUsd.toLocaleString("en-US", { minimumFractionDigits: 2 })}` : "$0.00"}
              </span>
              <span className="text-xs font-semibold text-slate-500 font-mono">USD</span>
            </div>
          </div>
        </div>

        {/* Current Tier Progress Bar */}
        <div className="bg-slate-950/50 border border-slate-800/60 rounded-xl p-4 mb-4">
          <div className="flex justify-between text-xs text-slate-300 mb-2">
            <span className="font-semibold flex items-center gap-1.5 text-slate-300">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              Progreso hacia {nextTier ? `${nextTier.badge} ${nextTier.name}` : "Nivel Apex"}
            </span>
            <span className="font-mono font-bold text-cyan-400">{progressPercent}% completado</span>
          </div>

          <div className="w-full bg-slate-900 rounded-full h-3 overflow-hidden border border-slate-800 relative">
            <div
              className="bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 h-full rounded-full transition-all duration-1000 relative shadow-glow"
              style={{ width: `${progressPercent}%` }}
            >
              <div className="absolute right-0 top-0 bottom-0 w-3 bg-white/80 blur-[2px] animate-pulse" />
            </div>
          </div>

          <div className="flex justify-between text-[11px] text-slate-500 mt-2">
            <span>Inicio: ${currentTier.minUsd.toLocaleString()} USD ({currentTier.name})</span>
            {nextMilestoneUsd && <span>Meta: ${nextMilestoneUsd.toLocaleString()} USD ({nextTier?.name})</span>}
          </div>
        </div>

        {/* Interactive Scale of ALL Tiers (Showing exactly how much is needed for each rank) */}
        {showAllRanks && (
          <div className="mt-6 pt-5 border-t border-slate-800/80">
            <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-cyan-400" />
              Escala de Rangos y Faltante Individual
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {RANKING_TIERS.filter((t) => t.minUsd > 0).map((tier) => {
                const isAchieved = currentVolume >= tier.minUsd;
                const neededForThisTier = Math.max(0, tier.minUsd - currentVolume);
                const tierPercent = Math.min(100, Math.max(0, parseFloat(((currentVolume / tier.minUsd) * 100).toFixed(1))));

                return (
                  <div
                    key={tier.id}
                    className={`p-3.5 rounded-xl border transition-all ${
                      isAchieved
                        ? "bg-emerald-950/30 border-emerald-500/40 shadow-sm"
                        : "bg-slate-950/60 border-slate-800"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{tier.badge}</span>
                        <span className="text-xs font-bold text-white">{tier.name}</span>
                      </div>
                      {isAchieved ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-800/60">
                          <CheckCircle2 className="w-3 h-3" />
                          ¡Alcanzado!
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono text-slate-400">
                          Meta ${tier.minUsd.toLocaleString()} USD
                        </span>
                      )}
                    </div>

                    {/* Progress to this specific tier */}
                    <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden my-2 border border-slate-800">
                      <div
                        className={`h-full rounded-full ${isAchieved ? "bg-emerald-400" : "bg-cyan-500"}`}
                        style={{ width: `${tierPercent}%` }}
                      />
                    </div>

                    <div className="text-[11px] flex justify-between items-center text-slate-400">
                      <span>{isAchieved ? "Completado" : `${tierPercent}%`}</span>
                      <span className={isAchieved ? "text-emerald-400 font-semibold" : "text-amber-400 font-mono font-semibold"}>
                        {isAchieved
                          ? "Nivel desbloqueado"
                          : `Faltan $${neededForThisTier.toLocaleString("en-US", { minimumFractionDigits: 2 })} USD`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
