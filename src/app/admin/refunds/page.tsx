import React from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { AdminRefundsClient } from "./AdminRefundsClient";
import { ArrowLeft } from "lucide-react";

export const revalidate = 0;

export default async function AdminRefundsPage() {
  const admin = await getCurrentUser();
  if (!admin || !admin.roles.includes("ADMIN")) {
    redirect("/dashboard");
  }

  const refunds = await prisma.refund.findMany({
    include: {
      buyer: { select: { firstName: true, lastName: true, email: true } },
      order: {
        include: {
          items: { include: { product: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <Link href="/admin" className="text-xs text-slate-400 hover:text-cyan-400 flex items-center gap-1.5">
        <ArrowLeft className="w-3.5 h-3.5" />
        Volver al Panel General
      </Link>

      <div>
        <h1 className="text-2xl sm:text-3xl font-heading font-black text-white">
          Gestión de Reembolsos en Garantía ({refunds.length})
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Al aprobar un reembolso, el sistema revierte automáticamente las comisiones de afiliado, ingresos de vendedor y revoca el acceso a las descargas en el ledger contable.
        </p>
      </div>

      <AdminRefundsClient initialRefunds={refunds} />
    </div>
  );
}
