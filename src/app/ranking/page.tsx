import React from "react";
import { getCurrentUser } from "@/lib/auth";
import { getLeaderboard, getUserRankingProgress, RANKING_TIERS } from "@/lib/ranking";
import { UserVolumeProgressBar } from "@/components/ranking/UserVolumeProgressBar";
import { COUNTRIES } from "@/lib/currency";
import { Award, DollarSign, Flame, Sparkles, TrendingUp, Trophy, Users } from "lucide-react";
import Link from "next/link";

import { FALLBACK_LEADERS } from "@/lib/mock-data";

export const dynamic = "force-dynamic";

export default async function RankingPage({
  searchParams,
}: {
  searchParams: { period?: string };
}) {
  const currentUser = await getCurrentUser();
  const period = searchParams.period || "ALL_TIME";

  let leaderboard: any[] = FALLBACK_LEADERS;
  try {
    const dbLeaders = await getLeaderboard(period, 50);
    if (dbLeaders && dbLeaders.length > 0) {
      leaderboard = dbLeaders as any;
    }
  } catch (err) {
    console.warn("Ranking page fallback:", err);
  }

  let userProgress = null;
  if (currentUser) {
    try {
      userProgress = await getUserRankingProgress(currentUser.id);
    } catch (err) {
      console.warn("User progress calculation fallback:", err);
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Title & Description */}
      <div className="text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs font-semibold mb-3">
          <Trophy className="w-3.5 h-3.5" />
          <span>Competencia Global de Alto Rendimiento</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-heading font-black text-white">
          Ranking Global de Ventas en USD
        </h1>
        <p className="mt-3 text-slate-400 text-sm leading-relaxed">
          El ranking de FALKO mide el <strong>volumen bruto de ventas generado en USD</strong> tanto por vendedores como por afiliados. Sube de categoría y desbloquea prestigio internacional.
        </p>
      </div>

      {/* ======================================================== */}
      {/* PERSONALIZED USER PROGRESS BAR (USER REQUIREMENT)         */}
      {/* ======================================================== */}
      {currentUser && userProgress ? (
        <div className="max-w-4xl mx-auto">
          <UserVolumeProgressBar
            currentVolume={userProgress.currentVolume}
            currentTier={userProgress.currentTier}
            nextTier={userProgress.nextTier}
            nextMilestoneUsd={userProgress.nextMilestoneUsd}
            remainingUsd={userProgress.remainingUsd}
            progressPercent={userProgress.progressPercent}
            rankPosition={userProgress.rankPosition}
          />
        </div>
      ) : (
        <div className="max-w-4xl mx-auto glass-panel rounded-2xl p-6 border border-slate-800 text-center">
          <h3 className="text-base font-bold text-white mb-1">
            ¿Quieres ver tu barra de progreso y nivel de ventas personal?
          </h3>
          <p className="text-xs text-slate-400 mb-4">
            Inicia sesión o crea tu cuenta gratuita para comenzar a acumular volumen en USD.
          </p>
          <div className="flex justify-center gap-3">
            <Link href="/login" className="btn-falcon-primary text-xs py-2 px-4">
              Iniciar Sesión
            </Link>
            <Link href="/register" className="btn-falcon-secondary text-xs py-2 px-4">
              Crear Cuenta
            </Link>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* LEADERBOARD FILTERS & PODIUM                             */}
      {/* ======================================================== */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800">
        {/* Period Filter Tabs */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-400" />
            <h3 className="text-lg font-heading font-bold text-white">Tabla de Líderes</h3>
          </div>

          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <Link
              href="/ranking?period=ALL_TIME"
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                period === "ALL_TIME"
                  ? "bg-cyan-500 text-slate-950 font-bold shadow-glow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Histórico Total
            </Link>
            <Link
              href="/ranking?period=MONTH"
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                period === "MONTH"
                  ? "bg-cyan-500 text-slate-950 font-bold shadow-glow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Este Mes
            </Link>
            <Link
              href="/ranking?period=WEEK"
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                period === "WEEK"
                  ? "bg-cyan-500 text-slate-950 font-bold shadow-glow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Esta Semana
            </Link>
          </div>
        </div>

        {/* Leaderboard Table / Cards */}
        {leaderboard.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-xs">
            Aún no hay ventas registradas en este período. ¡Sé el primero en posicionarte!
          </div>
        ) : (
          <div className="divide-y divide-slate-800/80 mt-2">
            {leaderboard.map((item) => {
              const isCurrentUser = currentUser?.id === item.userId;

              return (
                <div
                  key={item.userId}
                  className={`py-4 px-3 sm:px-4 rounded-xl flex items-center justify-between gap-4 transition-colors ${
                    isCurrentUser ? "bg-cyan-950/30 border border-cyan-500/40" : "hover:bg-slate-900/40"
                  }`}
                >
                  {/* Rank & User Avatar */}
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                    <div className="w-8 flex items-center justify-center font-black font-mono text-sm">
                      {item.rank === 1 ? (
                        <span className="text-xl">🥇</span>
                      ) : item.rank === 2 ? (
                        <span className="text-xl">🥈</span>
                      ) : item.rank === 3 ? (
                        <span className="text-xl">🥉</span>
                      ) : (
                        <span className="text-slate-400 text-xs">#{item.rank}</span>
                      )}
                    </div>

                    <div className="w-10 h-10 rounded-xl bg-slate-800 overflow-hidden border border-slate-700 shrink-0">
                      {item.avatarUrl ? (
                        <img src={item.avatarUrl} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-bold text-white text-xs bg-cyan-900">
                          {item.name[0]}
                        </div>
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-white text-sm truncate">{item.name}</span>
                        <span>{COUNTRIES[item.countryCode]?.flag || "🌐"}</span>
                        {isCurrentUser && (
                          <span className="text-[10px] bg-cyan-500 text-slate-950 font-bold px-1.5 py-0.2 rounded">
                            Tú
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <span>{item.tier.badge}</span>
                        <span>{item.tier.name}</span>
                      </span>
                    </div>
                  </div>

                  {/* Generated Volume Callout */}
                  <div className="text-right shrink-0">
                    <span className="text-[10px] uppercase text-slate-400 block font-semibold">
                      Volumen Generado
                    </span>
                    <span className="text-base sm:text-lg font-black font-mono text-cyan-400">
                      ${item.salesVolumeUsd.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono ml-1">USD</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Milestones Reference Cards */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800">
        <h3 className="text-lg font-heading font-bold text-white mb-4">
          Insignias y Niveles Oficiales FALKO
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {RANKING_TIERS.map((tier) => (
            <div key={tier.id} className="bg-slate-950/60 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{tier.badge}</span>
                  <span className="font-bold text-sm text-white">{tier.name}</span>
                </div>
                <span className="text-xs font-mono font-bold text-cyan-400">
                  ${tier.minUsd.toLocaleString()} USD
                </span>
              </div>
              <p className="text-xs text-slate-400">{tier.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
