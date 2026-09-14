import React from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { COUNTRIES, formatCurrency } from "@/lib/currency";
import { DollarSign, ShieldCheck, ArrowLeft } from "lucide-react";
import { WithdrawalsClient } from "./WithdrawalsClient";

export const revalidate = 0;

export default async function WithdrawalsPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login?redirect=/withdrawals");
  }

  const wallet = await prisma.wallet.findUnique({
    where: { userId: user.id },
  });

  const withdrawals = await prisma.withdrawal.findMany({
    where: { userId: user.id },
    include: { withdrawalMethod: true },
    orderBy: { createdAt: "desc" },
  });

  const countryInfo = COUNTRIES[user.countryCode] || COUNTRIES["US"];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Back button */}
      <Link href="/wallet" className="text-xs text-slate-400 hover:text-cyan-400 flex items-center gap-1.5">
        <ArrowLeft className="w-3.5 h-3.5" />
        Volver a la Billetera
      </Link>

      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs uppercase font-bold text-cyan-400">
            Pagos Internacionales
          </span>
          <span className="text-[10px] bg-slate-900 border border-slate-700 px-2 py-0.5 rounded-full text-slate-300 font-mono">
            {countryInfo.flag} {countryInfo.name} ({countryInfo.currency})
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-heading font-black text-white">
          Solicitud de Retiro de Fondos
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Los métodos de transferencia se adaptan automáticamente a tu país de residencia configurado ({countryInfo.name}).
        </p>
      </div>

      <WithdrawalsClient
        wallet={wallet}
        withdrawals={withdrawals}
        countryInfo={countryInfo}
        currentUser={user}
      />
    </div>
  );
}
