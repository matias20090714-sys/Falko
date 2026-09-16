import React from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatCurrency } from "@/lib/currency";
import { getUserRankingProgress } from "@/lib/ranking";
import { UserVolumeProgressBar } from "@/components/ranking/UserVolumeProgressBar";
import {
  DollarSign,
  Lock,
  MousePointerClick,
  Percent,
  PlusCircle,
  Share2,
  Sparkles,
  TrendingUp,
  Trophy,
  Users,
} from "lucide-react";
import { AffiliateClient } from "./AffiliateClient";
import { DashboardShell } from "@/components/layout/DashboardShell";

export const revalidate = 0;

export default async function AffiliateDashboardPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login?redirect=/affiliate");
  }

  // Ensure affiliate profile
  let affiliateProfile = await prisma.affiliateProfile.findUnique({
    where: { userId: user.id },
    include: {
      affiliateProducts: {
        include: {
          product: {
            include: {
              category: true,
              seller: { select: { firstName: true, lastName: true } },
            },
          },
        },
        orderBy: { conversionsCount: "desc" },
      },
    },
  });

  if (!affiliateProfile) {
    const count = await prisma.affiliateProfile.count();
    const affiliateCode = `AFF-${String(count + 1).padStart(6, "0")}`;

    affiliateProfile = await prisma.affiliateProfile.create({
      data: {
        userId: user.id,
        affiliateCode,
      },
      include: {
        affiliateProducts: {
          include: {
            product: {
              include: {
                category: true,
                seller: { select: { firstName: true, lastName: true } },
              },
            },
          },
        },
      },
    });

    await prisma.userRole.upsert({
      where: { userId_role: { userId: user.id, role: "AFFILIATE" } },
      create: { userId: user.id, role: "AFFILIATE" },
      update: {},
    });
  }

  const wallet = await prisma.wallet.findUnique({
    where: { userId: user.id },
  });

  const userProgress = await getUserRankingProgress(user.id);

  const totalClicks = affiliateProfile.affiliateProducts.reduce((acc, p) => acc + p.clicksCount, 0);
  const totalConversions = affiliateProfile.affiliateProducts.reduce(
    (acc, p) => acc + p.conversionsCount,
    0
  );
  const overallConversionRate =
    totalClicks > 0 ? ((totalConversions / totalClicks) * 100).toFixed(1) : "0.0";

  return (
    <DashboardShell initialUser={user}>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs uppercase font-bold text-purple-400">
                Programa de Afiliados
              </span>
              <span className="text-[10px] bg-purple-950 text-purple-300 border border-purple-800 px-2 py-0.5 rounded-full font-mono font-bold">
                ID: {affiliateProfile.affiliateCode}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-heading font-black text-white">
              Affiliate Hub
            </h1>
          </div>

          <div className="flex gap-2">
            <Link href="/affiliate/products" className="btn-falcon-primary text-xs py-2 px-4 shadow-glow">
              <Share2 className="w-3.5 h-3.5" />
              Explorar Catálogo para Promocionar
            </Link>
            <Link href="/wallet" className="btn-falcon-secondary text-xs py-2 px-3.5">
              <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
              Billetera
            </Link>
          </div>
        </div>

        {/* ======================================================== */}
        {/* PERSONALIZED RANKING PROGRESS BAR                        */}
        {/* ======================================================== */}
        <UserVolumeProgressBar
          currentVolume={userProgress.currentVolume}
          currentTier={userProgress.currentTier}
          nextTier={userProgress.nextTier}
          nextMilestoneUsd={userProgress.nextMilestoneUsd}
          remainingUsd={userProgress.remainingUsd}
          progressPercent={userProgress.progressPercent}
          rankPosition={userProgress.rankPosition}
        />

        {/* Metrics Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-panel rounded-2xl p-5 border border-slate-800">
            <span className="text-xs text-slate-400 block mb-1">Comisión Disponible (Retirable)</span>
            <div className="text-2xl font-black font-mono text-emerald-400">
              {formatCurrency(wallet?.availableBalance || 0, wallet?.currencyCode || "USD")}
            </div>
            <span className="text-[10px] text-slate-500 block mt-1">Listo para transferir a tu banco</span>
          </div>

          <div className="glass-panel rounded-2xl p-5 border border-slate-800">
            <span className="text-xs text-slate-400 block mb-1">Comisión en Garantía (Pending)</span>
            <div className="text-2xl font-black font-mono text-amber-400">
              {formatCurrency(wallet?.pendingBalance || 0, wallet?.currencyCode || "USD")}
            </div>
            <span className="text-[10px] text-slate-500 block mt-1">Se libera al cumplir garantía</span>
          </div>

          <div className="glass-panel rounded-2xl p-5 border border-slate-800">
            <span className="text-xs text-slate-400 block mb-1">Ventas Referidas</span>
            <div className="text-2xl font-black font-mono text-white">{totalConversions}</div>
            <span className="text-[10px] text-purple-400 block mt-1">Conversiones exitosas</span>
          </div>

          <div className="glass-panel rounded-2xl p-5 border border-slate-800">
            <span className="text-xs text-slate-400 block mb-1">Total Clics y Tasa Conv.</span>
            <div className="text-2xl font-black font-mono text-cyan-400">
              {totalClicks} <span className="text-xs font-normal text-slate-400">({overallConversionRate}%)</span>
            </div>
            <span className="text-[10px] text-slate-500 block mt-1">Tracking en tiempo real</span>
          </div>
        </div>

        {/* Affiliate Promotional Links Table */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="font-bold text-white text-base">
              Tus Enlaces de Afiliado Activos ({affiliateProfile.affiliateProducts.length})
            </h3>
            <Link href="/affiliate/products" className="text-xs text-cyan-400 hover:underline">
              + Promocionar más productos
            </Link>
          </div>

          <AffiliateClient
            affiliateProducts={affiliateProfile.affiliateProducts}
            affiliateCode={affiliateProfile.affiliateCode}
          />
        </div>
      </div>
    </DashboardShell>
  );
}
