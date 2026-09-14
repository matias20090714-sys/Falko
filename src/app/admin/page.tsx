import React from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getPlatformOwnerWallet } from "@/lib/ledger";
import { formatCurrency } from "@/lib/currency";
import {
  Building2,
  CheckCircle2,
  DollarSign,
  Lock,
  Package,
  RefreshCw,
  Settings,
  Shield,
  ShieldAlert,
  ShoppingBag,
  TrendingUp,
  Trophy,
  Users,
  Wallet,
} from "lucide-react";

export const revalidate = 0;

export default async function AdminDashboardPage() {
  const user = await getCurrentUser();
  if (!user || !user.roles.includes("ADMIN")) {
    redirect("/dashboard");
  }

  const ownerWallet = await getPlatformOwnerWallet();

  // Metrics
  const totalUsers = await prisma.user.count();
  const totalProducts = await prisma.product.count();
  const totalOrders = await prisma.order.count({ where: { status: "CONFIRMED" } });
  const pendingWithdrawalsCount = await prisma.withdrawal.count({ where: { status: "PENDING" } });
  const pendingRefundsCount = await prisma.refund.count({ where: { status: "REQUESTED" } });

  // Sum of all gross confirmed orders
  const grossVolumeResult = await prisma.order.aggregate({
    where: { status: "CONFIRMED" },
    _sum: { totalAmount: true },
  });
  const grossVolumeUsd = grossVolumeResult._sum.totalAmount || 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs uppercase font-bold text-rose-400">
              Panel de Administración
            </span>
            <span className="text-[10px] bg-rose-950 text-rose-300 border border-rose-800 px-2 py-0.5 rounded-full font-mono font-bold">
              SUPERADMIN PRIVILEGES
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-black text-white">
            FALKO Executive Control Center
          </h1>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link href="/admin/settings" className="btn-falcon-secondary text-xs py-2 px-3.5">
            <Settings className="w-3.5 h-3.5" />
            Configuración
          </Link>
          <Link href="/admin/withdrawals" className="btn-falcon-primary text-xs py-2 px-3.5 shadow-glow">
            <DollarSign className="w-3.5 h-3.5" />
            Retiros ({pendingWithdrawalsCount})
          </Link>
        </div>
      </div>

      {/* Navigation Sub-bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800 text-xs font-semibold">
        <Link href="/admin" className="px-3.5 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold shadow-glow">
          Vista General
        </Link>
        <Link href="/admin/users" className="px-3.5 py-2 rounded-xl bg-slate-900 text-slate-300 hover:text-white border border-slate-800">
          Usuarios ({totalUsers})
        </Link>
        <Link href="/admin/products" className="px-3.5 py-2 rounded-xl bg-slate-900 text-slate-300 hover:text-white border border-slate-800">
          Productos ({totalProducts})
        </Link>
        <Link href="/admin/withdrawals" className="px-3.5 py-2 rounded-xl bg-slate-900 text-slate-300 hover:text-white border border-slate-800">
          Retiros ({pendingWithdrawalsCount})
        </Link>
        <Link href="/admin/refunds" className="px-3.5 py-2 rounded-xl bg-slate-900 text-slate-300 hover:text-white border border-slate-800">
          Reembolsos ({pendingRefundsCount})
        </Link>
        <Link href="/admin/settings" className="px-3.5 py-2 rounded-xl bg-slate-900 text-slate-300 hover:text-white border border-slate-800">
          Configuración Base
        </Link>
      </div>

      {/* Platform Owner Treasury Box (Rule 31: PLATFORM_OWNER WALLET) */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-cyan-500/40 shadow-glow relative overflow-hidden bg-gradient-to-r from-slate-950 via-[#07132a] to-slate-950">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-bold text-cyan-400">
                Billetera de Tesorería FALKO (Platform Owner)
              </span>
              <span className="text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-800 px-2 py-0.5 rounded font-mono">
                25 UYU Base / Tx
              </span>
            </div>
            <h3 className="text-xl font-heading font-black text-white">
              Ingresos Acumulados por Comisiones de Plataforma
            </h3>
            <p className="text-xs text-slate-400 max-w-xl">
              Cada venta ejecutada retiene automáticamente la comisión fija de FALKO (25 UYU equivalente en USD) acreditada directamente a la billetera central del propietario.
            </p>
          </div>

          <div className="bg-slate-950/80 border border-cyan-500/50 rounded-2xl p-5 text-right shrink-0 shadow-lg">
            <span className="text-xs text-slate-400 block mb-1">Total Tesorería Acumulado</span>
            <div className="text-3xl font-black font-mono text-cyan-400">
              {formatCurrency(ownerWallet.totalBalance, ownerWallet.currencyCode)}
            </div>
            <span className="text-[10px] text-emerald-400 font-mono block mt-1">
              Disponible para retiro: {formatCurrency(ownerWallet.availableBalance, ownerWallet.currencyCode)}
            </span>
          </div>
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel rounded-2xl p-5 border border-slate-800">
          <span className="text-xs text-slate-400 block mb-1">Volumen Bruto Procesado</span>
          <div className="text-2xl font-black font-mono text-white">
            ${grossVolumeUsd.toLocaleString("en-US", { minimumFractionDigits: 2 })} <span className="text-xs text-slate-500">USD</span>
          </div>
          <span className="text-[10px] text-cyan-400 block mt-1">{totalOrders} órdenes confirmadas</span>
        </div>

        <div className="glass-panel rounded-2xl p-5 border border-slate-800">
          <span className="text-xs text-slate-400 block mb-1">Usuarios Registrados</span>
          <div className="text-2xl font-black font-mono text-white">{totalUsers}</div>
          <Link href="/admin/users" className="text-[11px] text-cyan-400 hover:underline block mt-1">
            Administrar usuarios →
          </Link>
        </div>

        <div className="glass-panel rounded-2xl p-5 border border-slate-800">
          <span className="text-xs text-slate-400 block mb-1">Retiros Pendientes</span>
          <div className="text-2xl font-black font-mono text-amber-400">{pendingWithdrawalsCount}</div>
          <Link href="/admin/withdrawals" className="text-[11px] text-amber-400 hover:underline block mt-1">
            Aprobar transferencias →
          </Link>
        </div>

        <div className="glass-panel rounded-2xl p-5 border border-slate-800">
          <span className="text-xs text-slate-400 block mb-1">Reembolsos Solicitados</span>
          <div className="text-2xl font-black font-mono text-rose-400">{pendingRefundsCount}</div>
          <Link href="/admin/refunds" className="text-[11px] text-rose-400 hover:underline block mt-1">
            Revisar solicitudes en garantía →
          </Link>
        </div>
      </div>

      {/* Quick Shortcuts Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-3">
          <h4 className="font-bold text-white text-sm flex items-center gap-2">
            <Users className="w-4 h-4 text-cyan-400" />
            Control de Usuarios
          </h4>
          <p className="text-xs text-slate-400">
            Visualiza balances, suspende cuentas fraudulentas y asigna roles administrativos con autorización server-side.
          </p>
          <Link href="/admin/users" className="btn-falcon-secondary text-xs py-2 px-3 block text-center">
            Ver Todos los Usuarios
          </Link>
        </div>

        <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-3">
          <h4 className="font-bold text-white text-sm flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-purple-400" />
            Moderación de Productos
          </h4>
          <p className="text-xs text-slate-400">
            Supervisa el catálogo público, suspende publicaciones infractoras y agrega motivos de moderación.
          </p>
          <Link href="/admin/products" className="btn-falcon-secondary text-xs py-2 px-3 block text-center">
            Gestionar Catálogo
          </Link>
        </div>

        <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-3">
          <h4 className="font-bold text-white text-sm flex items-center gap-2">
            <Settings className="w-4 h-4 text-emerald-400" />
            Parámetros Globales
          </h4>
          <p className="text-xs text-slate-400">
            Ajusta la comisión base de 25 UYU, el retiro mínimo en USD y la duración estándar de garantías.
          </p>
          <Link href="/admin/settings" className="btn-falcon-secondary text-xs py-2 px-3 block text-center">
            Editar Parámetros
          </Link>
        </div>
      </div>
    </div>
  );
}
