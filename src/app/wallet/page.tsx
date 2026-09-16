import React from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getUserWallet } from "@/lib/ledger";
import { formatCurrency } from "@/lib/currency";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Clock,
  DollarSign,
  History,
  Lock,
  RefreshCw,
  ShieldCheck,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { WalletClient } from "./WalletClient";
import { DashboardShell } from "@/components/layout/DashboardShell";

export const revalidate = 0;

export default async function WalletPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login?redirect=/wallet");
  }

  const wallet = await prisma.wallet.findUnique({
    where: { userId: user.id },
    include: {
      transactions: {
        orderBy: { createdAt: "desc" },
        take: 50,
      },
      guaranteeHolds: {
        where: { status: "HELD" },
        include: { order: true },
        orderBy: { releaseDate: "asc" },
      },
    },
  });

  return (
    <DashboardShell initialUser={user}>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs uppercase font-bold text-cyan-400">
                Gestión Financiera
              </span>
              <span className="text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-800 px-2 py-0.5 rounded-full font-mono">
                LEDGER INMUTABLE
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-heading font-black text-white">
              Billetera & Balance Contable
            </h1>
          </div>

          <div className="flex gap-2">
            <Link href="/withdrawals" className="btn-falcon-primary text-xs py-2 px-4 shadow-glow">
              <DollarSign className="w-3.5 h-3.5" />
              Solicitar Retiro de Fondos
            </Link>
          </div>
        </div>

        <WalletClient wallet={wallet} currentUser={user} />
      </div>
    </DashboardShell>
  );
}
