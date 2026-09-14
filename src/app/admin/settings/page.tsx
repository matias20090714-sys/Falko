import React from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { AdminSettingsClient } from "./AdminSettingsClient";
import { ArrowLeft } from "lucide-react";

export const revalidate = 0;

export default async function AdminSettingsPage() {
  const admin = await getCurrentUser();
  if (!admin || !admin.roles.includes("ADMIN")) {
    redirect("/dashboard");
  }

  const settings = await prisma.platformSettings.findMany();
  const settingsMap = settings.reduce((acc: any, s) => {
    acc[s.key] = s.value;
    return acc;
  }, {});

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <Link href="/admin" className="text-xs text-slate-400 hover:text-cyan-400 flex items-center gap-1.5">
        <ArrowLeft className="w-3.5 h-3.5" />
        Volver al Panel General
      </Link>

      <div>
        <h1 className="text-2xl sm:text-3xl font-heading font-black text-white">
          Configuración Global de FALKO
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Ajusta la tarifa de plataforma base en UYU, los límites de retiro y los períodos de retención de garantía.
        </p>
      </div>

      <AdminSettingsClient initialSettings={settingsMap} />
    </div>
  );
}
