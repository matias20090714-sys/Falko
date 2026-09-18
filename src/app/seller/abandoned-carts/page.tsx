import React from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { AbandonedCartsClient } from "./AbandonedCartsClient";
import { ArrowLeft, ShoppingCart, Sparkles } from "lucide-react";

export const revalidate = 0;

export default async function AbandonedCartsPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login?redirect=/seller/abandoned-carts");
  }

  // Fetch pending / abandoned orders for seller's products
  const pendingOrders = await prisma.order.findMany({
    where: {
      status: "PENDING",
      items: {
        some: {
          product: { sellerId: user.id },
        },
      },
    },
    include: {
      buyer: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          countryCode: true,
        },
      },
      items: {
        include: {
          product: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  // Also fetch seller's products to allow generating direct custom recovery links
  const products = await prisma.product.findMany({
    where: { sellerId: user.id },
    select: {
      id: true,
      slug: true,
      title: true,
      price: true,
      currencyCode: true,
      coverImageUrl: true,
    },
  });

  return (
    <DashboardShell initialUser={user}>
      <div className="max-w-6xl mx-auto space-y-8 pb-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
          <div>
            <Link
              href="/seller"
              className="inline-flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 mb-2 font-medium"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Volver a Seller Studio</span>
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-2xl bg-amber-950 border border-amber-500/40 flex items-center justify-center text-amber-400">
                <ShoppingCart className="w-4 h-4" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-heading font-black text-white">
                Recuperación de Carritos Abandonados
              </h1>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-xl">
              Detecta prospectos que iniciaron el proceso de compra pero no completaron el pago. Envíales un enlace de recuperación con 10% de descuento o contáctalos por WhatsApp.
            </p>
          </div>
        </div>

        <AbandonedCartsClient
          pendingOrders={pendingOrders}
          products={products}
          sellerName={user.firstName}
        />
      </div>
    </DashboardShell>
  );
}
