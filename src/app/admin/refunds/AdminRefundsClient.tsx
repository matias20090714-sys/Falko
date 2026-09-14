"use client";

import React, { useState } from "react";
import { formatCurrency } from "@/lib/currency";
import { Check, ShieldAlert, X } from "lucide-react";

export function AdminRefundsClient({ initialRefunds }: { initialRefunds: any[] }) {
  const [refunds, setRefunds] = useState(initialRefunds);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleAction = async (refundId: string, action: "APPROVE" | "REJECT") => {
    let notes = "";
    if (action === "APPROVE") {
      notes = prompt("Notas de aprobación de garantía (se ejecutarán las transacciones inversas en el ledger):") || "Aprobado dentro del período de garantía.";
    } else {
      notes = prompt("Motivo del rechazo de reembolso:") || "Solicitud fuera de los términos de garantía.";
      if (!notes) return;
    }

    setLoadingId(refundId);
    try {
      const res = await fetch("/api/admin/refunds/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refundId, action, notes }),
      });

      const data = await res.json();
      if (data.success) {
        setRefunds((prev) =>
          prev.map((r) => (r.id === refundId ? { ...r, status: action === "APPROVE" ? "APPROVED" : "REJECTED", adminNotes: notes } : r))
        );
      } else {
        alert(data.error || "Error al procesar el reembolso.");
      }
    } catch {
      alert("Error de conexión.");
    } finally {
      setLoadingId(null);
    }
  };

  if (refunds.length === 0) {
    return (
      <div className="glass-panel rounded-2xl p-12 text-center border border-slate-800">
        <ShieldAlert className="w-12 h-12 text-slate-600 mx-auto mb-4" />
        <h3 className="text-base font-bold text-white mb-1">Sin solicitudes de reembolso</h3>
        <p className="text-xs text-slate-400">
          Actualmente no existen reclamos o solicitudes de garantía pendientes.
        </p>
      </div>
    );
  }

  return (
    <div className="glass-panel rounded-2xl border border-slate-800 p-6 space-y-6">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
            <tr>
              <th className="py-3 px-3">Orden #</th>
              <th className="py-3 px-3">Comprador</th>
              <th className="py-3 px-3">Producto</th>
              <th className="py-3 px-3">Motivo Reclamo</th>
              <th className="py-3 px-3 text-right">Monto</th>
              <th className="py-3 px-3">Estado</th>
              <th className="py-3 px-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {refunds.map((r) => (
              <tr key={r.id} className="hover:bg-slate-900/30">
                <td className="py-3 px-3 font-mono font-bold text-white whitespace-nowrap">
                  #{r.order.orderNumber}
                </td>

                <td className="py-3 px-3">
                  <span className="font-bold text-white block">{r.buyer.firstName} {r.buyer.lastName}</span>
                  <span className="text-[10px] text-slate-400 font-mono">{r.buyer.email}</span>
                </td>

                <td className="py-3 px-3 text-slate-300 max-w-xs truncate">
                  {r.order.items[0]?.product?.title}
                </td>

                <td className="py-3 px-3 text-slate-400 max-w-xs truncate italic">
                  "{r.reason}"
                </td>

                <td className="py-3 px-3 text-right font-mono font-bold text-rose-400 whitespace-nowrap">
                  {formatCurrency(r.amount, r.currencyCode)}
                </td>

                <td className="py-3 px-3">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                      r.status === "APPROVED"
                        ? "bg-emerald-950 text-emerald-400 border-emerald-800"
                        : r.status === "REJECTED"
                        ? "bg-rose-950 text-rose-400 border-rose-800"
                        : "bg-amber-950 text-amber-400 border-amber-800"
                    }`}
                  >
                    {r.status}
                  </span>
                </td>

                <td className="py-3 px-3 text-right">
                  {r.status === "REQUESTED" ? (
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleAction(r.id, "APPROVE")}
                        disabled={loadingId === r.id}
                        className="bg-emerald-950/60 text-emerald-400 border border-emerald-800 px-2 py-1 rounded text-xs font-bold hover:bg-emerald-900"
                      >
                        Aprobar Reembolso
                      </button>
                      <button
                        onClick={() => handleAction(r.id, "REJECT")}
                        disabled={loadingId === r.id}
                        className="bg-rose-950/60 text-rose-400 border border-rose-800 px-2 py-1 rounded text-xs font-bold hover:bg-rose-900"
                      >
                        Rechazar
                      </button>
                    </div>
                  ) : (
                    <span className="text-[11px] text-slate-500 italic">Resuelto</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
