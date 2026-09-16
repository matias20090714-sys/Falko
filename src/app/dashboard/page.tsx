import React from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getUserRankingProgress } from "@/lib/ranking";
import { UserVolumeProgressBar } from "@/components/ranking/UserVolumeProgressBar";
import { formatCurrency } from "@/lib/currency";
import {
  Award,
  ChevronRight,
  DollarSign,
  Lock,
  Package,
  PlusCircle,
  Share2,
  Shield,
  ShoppingBag,
  Sparkles,
  TrendingUp,
  Trophy,
  User,
  Wallet,
  Zap,
} from "lucide-react";
import { RoleToggleButtons } from "./RoleToggleButtons";
import { DashboardShell } from "@/components/layout/DashboardShell";

export const revalidate = 0;

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login?redirect=/dashboard");
  }

  // Get user's wallet
  const wallet = await prisma.wallet.findUnique({
    where: { userId: user.id },
  });

  // Get purchases count
  const purchasesCount = await prisma.order.count({
    where: { buyerId: user.id, status: "CONFIRMED" },
  });

  // Get seller products count
  const productsCount = await prisma.product.count({
    where: { sellerId: user.id },
  });

  // Get affiliate stats
  const affiliateProfile = await prisma.affiliateProfile.findUnique({
    where: { userId: user.id },
    include: {
      affiliateProducts: true,
    },
  });

  // Get user ranking progress
  const userProgress = await getUserRankingProgress(user.id);

  return (
    <DashboardShell initialUser={user}>
      <div className="max-w-7xl mx-auto space-y-8">
      {/* Welcome Banner */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-glow relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-bold text-cyan-400 tracking-wider">
              Centro de Control FALKO
            </span>
            <span className="text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-800/80 px-2 py-0.5 rounded-full font-mono">
              {user.countryCode}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-black text-white">
            Bienvenido, {user.firstName} {user.lastName} 🦅
          </h1>
          <p className="text-xs text-slate-400">
            Administra tus compras, productos en venta, comisiones de afiliado y retiros desde un único lugar.
          </p>
        </div>

        {/* Quick Action Shortcuts */}
        <div className="flex flex-wrap gap-2.5">
          <Link href="/marketplace" className="btn-falcon-primary text-xs py-2 px-3.5 shadow-glow">
            <ShoppingBag className="w-3.5 h-3.5" />
            Explorar Marketplace
          </Link>
          <Link href="/wallet" className="btn-falcon-secondary text-xs py-2 px-3.5">
            <Wallet className="w-3.5 h-3.5 text-amber-400" />
            Ver Billetera
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

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Balance Disponible */}
        <div className="glass-panel rounded-2xl p-5 border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400">Saldo Disponible (Retirable)</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-950/80 text-emerald-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black font-mono text-emerald-400">
            {formatCurrency(wallet?.availableBalance || 0, wallet?.currencyCode || "USD")}
          </div>
          <Link href="/withdrawals" className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1 mt-2">
            Solicitar Retiro
            <ChevronRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Card 2: Saldo en Garantía (Pending) */}
        <div className="glass-panel rounded-2xl p-5 border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400">Retenido en Garantía</span>
            <div className="w-8 h-8 rounded-lg bg-amber-950/80 text-amber-400 flex items-center justify-center">
              <Lock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black font-mono text-amber-400">
            {formatCurrency(wallet?.pendingBalance || 0, wallet?.currencyCode || "USD")}
          </div>
          <span className="text-[10px] text-slate-500 block mt-2">Se libera tras cumplir 7-30 días</span>
        </div>

        {/* Card 3: Compras Activas */}
        <div className="glass-panel rounded-2xl p-5 border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400">Productos Comprados</span>
            <div className="w-8 h-8 rounded-lg bg-cyan-950/80 text-cyan-400 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black font-mono text-white">{purchasesCount}</div>
          <Link href="/library" className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1 mt-2">
            Ir a Descargas
            <ChevronRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Card 4: Productos Publicados */}
        <div className="glass-panel rounded-2xl p-5 border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400">Catálogo de Vendedor</span>
            <div className="w-8 h-8 rounded-lg bg-purple-950/80 text-purple-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black font-mono text-white">{productsCount}</div>
          <Link href="/seller" className="text-[11px] text-purple-400 hover:underline flex items-center gap-1 mt-2">
            Panel de Vendedor
            <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Role Activation Panels (Instant 1-Click Multi-Role Support) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Seller Mode Card */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-800/60 flex items-center justify-center text-cyan-400">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Modo Vendedor</h3>
                <p className="text-xs text-slate-400">Publica productos, define comisiones y recibe pagos.</p>
              </div>
            </div>
            {user.roles.includes("SELLER") && (
              <span className="text-xs bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 px-2 py-0.5 rounded font-bold">
                Activo
              </span>
            )}
          </div>

          <div className="flex items-center justify-between pt-2">
            {user.roles.includes("SELLER") ? (
              <div className="flex gap-2 w-full">
                <Link href="/seller" className="btn-falcon-primary text-xs py-2 px-4 flex-1 justify-center">
                  Ir al Panel de Vendedor
                </Link>
                <Link href="/seller/products/new" className="btn-falcon-secondary text-xs py-2 px-3">
                  <PlusCircle className="w-3.5 h-3.5" />
                  Nuevo Producto
                </Link>
              </div>
            ) : (
              <RoleToggleButtons role="SELLER" userHasRole={false} />
            )}
          </div>
        </div>

        {/* Affiliate Mode Card */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-950 border border-purple-800/60 flex items-center justify-center text-purple-400">
                <Share2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Modo Afiliado</h3>
                <p className="text-xs text-slate-400">Promociona productos de otros creadores y gana hasta 50%.</p>
              </div>
            </div>
            {user.roles.includes("AFFILIATE") && (
              <span className="text-xs bg-purple-500/20 text-purple-300 border border-purple-500/40 px-2 py-0.5 rounded font-bold font-mono">
                {user.affiliateCode || "Activo"}
              </span>
            )}
          </div>

          <div className="flex items-center justify-between pt-2">
            {user.roles.includes("AFFILIATE") ? (
              <div className="flex gap-2 w-full">
                <Link href="/affiliate" className="btn-falcon-secondary text-xs py-2 px-4 flex-1 justify-center border-purple-800 text-purple-300">
                  Panel de Afiliado
                </Link>
                <Link href="/affiliate/products" className="btn-falcon-primary text-xs py-2 px-3">
                  Ver Productos para Afiliarme
                </Link>
              </div>
            ) : (
              <RoleToggleButtons role="AFFILIATE" userHasRole={false} />
            )}
          </div>
        </div>
      </div>
      </div>
    </DashboardShell>
  );
}
