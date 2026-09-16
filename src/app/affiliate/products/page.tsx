import React from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { AffiliateCatalogClient } from "./AffiliateCatalogClient";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Share2 } from "lucide-react";

export const revalidate = 0;

export default async function AffiliateProductsCatalogPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login?redirect=/affiliate/products");
  }

  // Fetch all approved products with affiliate enabled
  const products = await prisma.product.findMany({
    where: {
      status: "APPROVED",
      affiliateEnabled: true,
    },
    include: {
      category: true,
      seller: { select: { firstName: true, lastName: true } },
    },
    orderBy: { salesCount: "desc" },
  });

  return (
    <DashboardShell initialUser={user}>
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs uppercase font-bold text-purple-400">
              Catálogo de Afiliación
            </span>
            <span className="text-[10px] bg-purple-950 text-purple-300 border border-purple-800 px-2 py-0.5 rounded-full font-mono">
              ALTO RENDIMIENTO
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-black text-white">
            Productos Disponibles para Promocionar
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Genera ingresos promoviendo herramientas, plantillas y cursos de creadores verificados en tu moneda preferida.
          </p>
        </div>

        <AffiliateCatalogClient products={products} />
      </div>
    </DashboardShell>
  );
}
