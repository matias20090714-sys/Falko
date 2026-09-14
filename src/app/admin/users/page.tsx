import React from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { AdminUsersClient } from "./AdminUsersClient";
import { ArrowLeft } from "lucide-react";

export const revalidate = 0;

export default async function AdminUsersPage() {
  const admin = await getCurrentUser();
  if (!admin || !admin.roles.includes("ADMIN")) {
    redirect("/dashboard");
  }

  const users = await prisma.user.findMany({
    include: {
      roles: true,
      wallet: true,
      affiliateProfile: true,
      _count: {
        select: {
          orders: true,
          products: true,
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
          Administración de Usuarios ({users.length})
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Supervisa cuentas, suspende accesos fraudulentos y modifica roles con autorización server-side.
        </p>
      </div>

      <AdminUsersClient initialUsers={users} />
    </div>
  );
}
