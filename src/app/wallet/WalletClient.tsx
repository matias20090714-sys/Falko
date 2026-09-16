"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  Sparkles,
  TrendingUp,
} from "lucide-react";
import CountryWithdrawalsGuide from "@/components/wallet/CountryWithdrawalsGuide";

export function WalletClient({ wallet, currentUser }: { wallet: any; currentUser: any }) {
  const router = useRouter();
  const [releasing, setReleasing] = useState(false);
  const [releaseMsg, setReleaseMsg] = useState("");

  const handleSimulateGuaranteeRelease = async () => {
    setReleasing(true);
    setReleaseMsg("");
    try {
      const res = await fetch("/api/admin/release-guarantees", {
        method: "POST",
      });
      const data = await res.json();
      if (data.success) {
        setReleaseMsg(`Procesado: ${data.processedCount} garantías maduradas transferidas a Disponible.`);
        router.refresh();
      } else {
        setReleaseMsg(data.error || "Error al procesar garantías.");
      }
    } catch {
      setReleaseMsg("Error de conexión.");
    } finally {
      setReleasing(false);
    }
  };

  const getTransactionBadge = (type: string) => {
    switch (type) {
      case "SELLER_EARNING":
        return <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded text-[10px] font-bold">Venta Creador</span>;
      case "AFFILIATE_COMMISSION":
        return <span className="bg-purple-950 text-purple-400 border border-purple-800 px-2 py-0.5 rounded text-[10px] font-bold">Comisión Afiliado</span>;
      case "PLATFORM_COMMISSION":
        return <span className="bg-cyan-950 text-cyan-400 border border-cyan-800 px-2 py-0.5 rounded text-[10px] font-bold">Tarifa FALKO</span>;
      case "GUARANTEE_RELEASE":
        return <span className="bg-blue-950 text-blue-400 border border-blue-800 px-2 py-0.5 rounded text-[10px] font-bold">Garantía Liberada</span>;
      case "REFUND":
        return <span className="bg-rose-950 text-rose-400 border border-rose-800 px-2 py-0.5 rounded text-[10px] font-bold">Reembolso</span>;
      case "WITHDRAWAL_REQUESTED":
      case "WITHDRAWAL_PAID":
        return <span className="bg-amber-950 text-amber-400 border border-amber-800 px-2 py-0.5 rounded text-[10px] font-bold">Retiro</span>;
      default:
        return <span className="bg-slate-900 text-slate-400 border border-slate-700 px-2 py-0.5 rounded text-[10px] font-bold">{type}</span>;
    }
  };

  return (
    <div className="space-y-8">
      {/* 4 Financial Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Available Balance */}
        <div className="glass-panel rounded-2xl p-5 border border-emerald-500/40 shadow-glow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-emerald-300 font-semibold">Saldo Disponible</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-950 text-emerald-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black font-mono text-emerald-400">
            {formatCurrency(wallet?.availableBalance || 0, wallet?.currencyCode || "USD")}
          </div>
          <span className="text-[10px] text-slate-400 block mt-2">100% libre para retirar a tu cuenta</span>
        </div>

        {/* Pending Balance in Guarantee */}
        <div className="glass-panel rounded-2xl p-5 border border-amber-500/40 shadow-glow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-amber-300 font-semibold">Retenido en Garantía</span>
            <div className="w-8 h-8 rounded-lg bg-amber-950 text-amber-400 flex items-center justify-center">
              <Lock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black font-mono text-amber-400">
            {formatCurrency(wallet?.pendingBalance || 0, wallet?.currencyCode || "USD")}
          </div>
          <span className="text-[10px] text-slate-400 block mt-2">Protegido por período 7-30 días</span>
        </div>

        {/* Withdrawn Balance */}
        <div className="glass-panel rounded-2xl p-5 border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400">Total Retirado</span>
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-slate-400 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black font-mono text-white">
            {formatCurrency(wallet?.withdrawnBalance || 0, wallet?.currencyCode || "USD")}
          </div>
          <span className="text-[10px] text-slate-500 block mt-2">Transferencias pagadas</span>
        </div>

        {/* Total Ledger Balance */}
        <div className="glass-panel rounded-2xl p-5 border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400">Balance Total Acumulado</span>
            <div className="w-8 h-8 rounded-lg bg-cyan-950 text-cyan-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black font-mono text-cyan-400">
            {formatCurrency(wallet?.totalBalance || 0, wallet?.currencyCode || "USD")}
          </div>
          <span className="text-[10px] text-slate-500 block mt-2">Disponible + Pendiente</span>
        </div>
      </div>

      {/* Visual Country-by-Country Local Withdrawal Guide */}
      <CountryWithdrawalsGuide />

      {/* Guarantee Release Simulation Tool */}
      <div className="glass-panel rounded-2xl p-5 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-950/60">
        <div>
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            Motor de Verificación & Liberación de Garantías
          </h4>
          <p className="text-xs text-slate-400 mt-0.5">
            Ejecuta la revisión automática de órdenes con períodos cumplidos para transferir saldo retenido a saldo disponible.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {releaseMsg && <span className="text-xs text-cyan-400 font-semibold">{releaseMsg}</span>}
          <button
            onClick={handleSimulateGuaranteeRelease}
            disabled={releasing}
            className="btn-falcon-secondary text-xs py-2 px-3.5 whitespace-nowrap"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${releasing ? "animate-spin" : ""}`} />
            {releasing ? "Verificando..." : "Ejecutar Maduración de Garantías"}
          </button>
        </div>
      </div>

      {/* Active Guarantee Holds Table */}
      {wallet?.guaranteeHolds?.length > 0 && (
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
          <h3 className="font-bold text-white text-base pb-3 border-b border-slate-800 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            Fondos Activos Retenidos en Garantía ({wallet.guaranteeHolds.length})
          </h3>

          <div className="divide-y divide-slate-800 text-xs">
            {wallet.guaranteeHolds.map((hold: any) => (
              <div key={hold.id} className="py-3 flex justify-between items-center">
                <div>
                  <span className="font-bold text-white block">Orden #{hold.order?.orderNumber}</span>
                  <span className="text-[11px] text-slate-400">
                    Fecha de liberación programada: <strong>{new Date(hold.releaseDate).toLocaleDateString()}</strong>
                  </span>
                </div>
                <div className="text-right font-mono font-bold text-amber-400">
                  +{formatCurrency(hold.amount, hold.currencyCode)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Immutable Double-Entry Ledger History */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h3 className="font-bold text-white text-base flex items-center gap-2">
            <History className="w-4 h-4 text-cyan-400" />
            Libro Mayor de Transacciones (Ledger Inmutable)
          </h3>
          <span className="text-xs text-slate-500 font-mono">
            {wallet?.transactions?.length || 0} movimientos
          </span>
        </div>

        {!wallet?.transactions || wallet.transactions.length === 0 ? (
          <div className="text-center py-10 text-slate-500 text-xs">
            Aún no tienes movimientos registrados en tu billetera.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-2">Fecha</th>
                  <th className="py-3 px-2">Tipo</th>
                  <th className="py-3 px-2">Descripción</th>
                  <th className="py-3 px-2 text-right">Monto</th>
                  <th className="py-3 px-2 text-right">Balance Resultante</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {wallet.transactions.map((tx: any) => {
                  const isPositive = tx.amount > 0;
                  return (
                    <tr key={tx.id} className="hover:bg-slate-900/30">
                      <td className="py-3 px-2 text-slate-400 whitespace-nowrap">
                        {new Date(tx.createdAt).toLocaleDateString()}{" "}
                        <span className="text-[10px] text-slate-500">
                          {new Date(tx.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </td>
                      <td className="py-3 px-2 whitespace-nowrap">
                        {getTransactionBadge(tx.type)}
                      </td>
                      <td className="py-3 px-2 font-sans text-slate-300 max-w-xs truncate">
                        {tx.description}
                      </td>
                      <td className={`py-3 px-2 text-right font-bold whitespace-nowrap ${isPositive ? "text-emerald-400" : "text-rose-400"}`}>
                        {isPositive ? "+" : ""}{formatCurrency(tx.amount, tx.currencyCode)}
                      </td>
                      <td className="py-3 px-2 text-right text-slate-300 font-bold whitespace-nowrap">
                        {formatCurrency(tx.balanceAfter, tx.currencyCode)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
