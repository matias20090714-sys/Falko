import React from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatCurrency } from "@/lib/currency";
import { DashboardShell } from "@/components/layout/DashboardShell";
import {
  DollarSign,
  Lock,
  PlusCircle,
  ShoppingBag,
  TrendingUp,
  Users,
  ChevronRight,
  ShieldCheck,
  Star,
  Clock,
  Webhook,
  GraduationCap,
  Rocket,
  Sparkles,
  BookOpen,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

export const revalidate = 0;

export default async function SellerDashboardPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login?redirect=/seller");
  }

  // Ensure seller role
  if (!user.roles.includes("SELLER")) {
    await prisma.userRole.upsert({
      where: { userId_role: { userId: user.id, role: "SELLER" } },
      create: { userId: user.id, role: "SELLER" },
      update: {},
    });
  }

  const wallet = await prisma.wallet.findUnique({
    where: { userId: user.id },
  });

  const products = await prisma.product.findMany({
    where: { sellerId: user.id },
    include: {
      category: true,
      affiliateProducts: {
        where: { status: "PENDING" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Fetch recent sales for seller
  const salesOrders = await prisma.order.findMany({
    where: {
      items: {
        some: {
          product: { sellerId: user.id },
        },
      },
    },
    take: 10,
    orderBy: { createdAt: "desc" },
    include: {
      buyer: { select: { firstName: true, lastName: true, email: true } },
      items: { include: { product: true } },
    },
  });

  const totalSalesCount = products.reduce((acc, p) => acc + p.salesCount, 0);
  const pendingAffiliateRequestsCount = products.reduce(
    (acc, p) => acc + p.affiliateProducts.length,
    0
  );

  return (
    <DashboardShell initialUser={user}>
      <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs uppercase font-bold text-cyan-400">
              Panel del Creador
            </span>
            <span className="text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-800 px-2 py-0.5 rounded-full font-mono">
              SELLER ACTIVE
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-black text-white">
            Seller Studio
          </h1>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link href="/seller/academy" className="btn-falcon-secondary text-xs py-2 px-3.5 text-cyan-300 hover:text-cyan-200 bg-cyan-950/40 border-cyan-500/30">
            <GraduationCap className="w-3.5 h-3.5 text-cyan-400" />
            <span>Academia de Ventas</span>
          </Link>
          <Link href="/migrate" className="btn-falcon-secondary text-xs py-2 px-3.5 text-amber-300 hover:text-amber-200 bg-amber-950/30 border-amber-500/30">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Migrar Productos</span>
          </Link>
          <Link href="/seller/webhooks" className="btn-falcon-secondary text-xs py-2 px-3.5">
            <Webhook className="w-3.5 h-3.5 text-cyan-400" />
            <span>Webhooks & CRM</span>
          </Link>
          <Link href="/seller/products/new" className="btn-falcon-primary text-xs py-2 px-4 shadow-glow">
            <PlusCircle className="w-3.5 h-3.5" />
            Crear Producto
          </Link>
          <Link href="/wallet" className="btn-falcon-secondary text-xs py-2 px-3.5">
            <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
            Billetera
          </Link>
        </div>
      </div>

      {/* Beginner Welcome & Quick Roadmap Banner */}
      {products.length === 0 && (
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-cyan-500/40 bg-gradient-to-r from-cyan-950/30 via-slate-950 to-slate-950 shadow-2xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-mono font-bold text-cyan-400">
                ¡Bienvenido al Panel de Creador!
              </span>
              <h2 className="text-xl font-bold text-white">Tu Ruta para Realizar tu Primera Venta</h2>
              <p className="text-xs text-slate-300 max-w-xl">
                Hemos preparado un asistente rápido en 3 pasos para que puedas publicar tu primer producto en menos de 60 segundos.
              </p>
            </div>

            <div className="flex gap-2">
              <Link href="/seller/products/new" className="btn-falcon-primary text-xs py-2.5 px-5 shadow-glow flex items-center gap-1.5 font-bold">
                <Rocket className="w-3.5 h-3.5" />
                <span>Subir mi Producto Ahora</span>
              </Link>
              <Link href="/seller/academy" className="btn-falcon-secondary text-xs py-2.5 px-4 text-slate-300">
                Ver Guía de Inicio
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel rounded-2xl p-5 border border-slate-800">
          <span className="text-xs text-slate-400 block mb-1">Saldo Disponible (Retirable)</span>
          <div className="text-2xl font-black font-mono text-emerald-400">
            {formatCurrency(wallet?.availableBalance || 0, wallet?.currencyCode || "USD")}
          </div>
          <span className="text-[10px] text-slate-500 block mt-1">Listo para transferir a tu cuenta</span>
        </div>

        <div className="glass-panel rounded-2xl p-5 border border-slate-800">
          <span className="text-xs text-slate-400 block mb-1">Ingresos en Garantía (Pending)</span>
          <div className="text-2xl font-black font-mono text-amber-400">
            {formatCurrency(wallet?.pendingBalance || 0, wallet?.currencyCode || "USD")}
          </div>
          <span className="text-[10px] text-slate-500 block mt-1">Retenido 7-30 días según producto</span>
        </div>

        <div className="glass-panel rounded-2xl p-5 border border-slate-800">
          <span className="text-xs text-slate-400 block mb-1">Total Ventas Realizadas</span>
          <div className="text-2xl font-black font-mono text-white">{totalSalesCount}</div>
          <span className="text-[10px] text-cyan-400 block mt-1">Unidades despachadas</span>
        </div>

        <div className="glass-panel rounded-2xl p-5 border border-slate-800">
          <span className="text-xs text-slate-400 block mb-1">Solicitudes de Afiliados</span>
          <div className="text-2xl font-black font-mono text-purple-400">
            {pendingAffiliateRequestsCount}
          </div>
          <Link href="/seller/affiliates" className="text-[11px] text-purple-400 hover:underline block mt-1">
            Gestionar Solicitudes →
          </Link>
        </div>
      </div>

      {/* Products & Recent Sales 2-Column Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Products List (2 Cols) */}
        <div className="lg:col-span-2 glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="font-bold text-white text-base">Mis Productos en Venta ({products.length})</h3>
            <Link href="/seller/products/new" className="text-xs text-cyan-400 hover:underline">
              + Agregar Producto
            </Link>
          </div>

          {products.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-xs">
              Aún no has publicado productos. ¡Crea tu primer producto digital para comenzar a facturar!
            </div>
          ) : (
            <div className="divide-y divide-slate-800">
              {products.map((p) => (
                <div key={p.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-slate-900 overflow-hidden border border-slate-800 shrink-0">
                      <img src={p.coverImageUrl} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-white line-clamp-1">{p.title}</h4>
                      <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-0.5">
                        <span className="text-cyan-400 font-mono font-bold">
                          {formatCurrency(p.price, p.currencyCode)}
                        </span>
                        <span>•</span>
                        <span>{p.salesCount} ventas</span>
                        <span>•</span>
                        <span>Afiliados: {p.affiliateEnabled ? `${p.affiliateCommissionPct}% (${p.affiliateApprovalMode})` : "Desactivado"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                      {p.status}
                    </span>
                    <Link
                      href={`/product/${p.slug}`}
                      className="btn-falcon-secondary text-xs py-1.5 px-3"
                    >
                      Ver en Tienda
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Sales Ledger Activity */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
          <h3 className="font-bold text-white text-base pb-3 border-b border-slate-800">
            Últimas Ventas Recibidas
          </h3>

          {salesOrders.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-xs">
              No hay ventas recientes registradas.
            </div>
          ) : (
            <div className="space-y-3">
              {salesOrders.map((ord) => (
                <div
                  key={ord.id}
                  className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 text-xs space-y-1"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-white truncate max-w-[140px]">
                      {ord.items[0]?.product?.title}
                    </span>
                    <span className="font-mono font-bold text-emerald-400">
                      +{formatCurrency(ord.sellerEarningAmount, ord.currencyCode)}
                    </span>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>{ord.buyer?.firstName} {ord.buyer?.lastName}</span>
                    <span>{new Date(ord.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      </div>
    </DashboardShell>
  );
}
