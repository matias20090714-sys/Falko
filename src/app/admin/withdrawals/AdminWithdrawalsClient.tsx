"use client";

import React, { useState } from "react";
import { formatCurrency, COUNTRIES } from "@/lib/currency";
import { Check, DollarSign, Eye, X } from "lucide-react";

export function AdminWithdrawalsClient({ initialWithdrawals }: { initialWithdrawals: any[] }) {
  const [withdrawals, setWithdrawals] = useState(initialWithdrawals);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [selectedDetails, setSelectedDetails] = useState<any>(null);

  const handleAction = async (withdrawalId: string, action: "PAID" | "REJECT") => {
    let notes = "";
    if (action === "REJECT") {
      notes = prompt("Ingresa el motivo del rechazo del retiro (se devolverán los fondos al saldo disponible):") || "";
      if (!notes) return;
    } else {
      notes = prompt("Notas de confirmación bancaria (opcional):") || "Transferencia liquidada exitosamente.";
    }

    setLoadingId(withdrawalId);
    try {
      const res = await fetch("/api/admin/withdrawals/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ withdrawalId, action, notes }),
      });

      const data = await res.json();
      if (data.success) {
        setWithdrawals((prev) =>
          prev.map((w) => (w.id === withdrawalId ? { ...w, status: action, adminNotes: notes } : w))
        );
      } else {
        alert(data.error || "Error al procesar el retiro.");
      }
    } catch {
      alert("Error de conexión.");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="glass-panel rounded-2xl border border-slate-800 p-6 space-y-6">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
            <tr>
              <th className="py-3 px-3">Retiro #</th>
              <th className="py-3 px-3">Usuario</th>
              <th className="py-3 px-3">Método Local</th>
              <th className="py-3 px-3 text-right">Monto</th>
              <th className="py-3 px-3">Estado</th>
              <th className="py-3 px-3">Fecha</th>
              <th className="py-3 px-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {withdrawals.map((w) => {
              let parsedDetails = {};
              try {
                parsedDetails = JSON.parse(w.withdrawalMethod?.accountDetailsJson || "{}");
              } catch {}

              return (
                <tr key={w.id} className="hover:bg-slate-900/30">
                  <td className="py-3 px-3 font-mono font-bold text-white whitespace-nowrap">
                    #{w.withdrawalNumber}
                  </td>

                  <td className="py-3 px-3">
                    <span className="font-bold text-white block">{w.user.firstName} {w.user.lastName}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{w.user.email}</span>
                  </td>

                  <td className="py-3 px-3 text-slate-300">
                    <span className="font-semibold block">{w.withdrawalMethod?.methodType}</span>
                    <button
                      onClick={() => setSelectedDetails({ ...w, details: parsedDetails })}
                      className="text-[10px] text-cyan-400 hover:underline flex items-center gap-1 mt-0.5"
                    >
                      <Eye className="w-3 h-3" /> Ver datos bancarios
                    </button>
                  </td>

                  <td className="py-3 px-3 text-right font-mono font-black text-emerald-400 text-sm whitespace-nowrap">
                    {formatCurrency(w.amount, w.currencyCode)}
                  </td>

                  <td className="py-3 px-3">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                        w.status === "PAID"
                          ? "bg-emerald-950 text-emerald-400 border-emerald-800"
                          : w.status === "REJECTED"
                          ? "bg-rose-950 text-rose-400 border-rose-800"
                          : "bg-amber-950 text-amber-400 border-amber-800"
                      }`}
                      title={w.adminNotes}
                    >
                      {w.status}
                    </span>
                  </td>

                  <td className="py-3 px-3 text-slate-400 text-[11px] whitespace-nowrap font-mono">
                    {new Date(w.createdAt).toLocaleDateString()}
                  </td>

                  <td className="py-3 px-3 text-right">
                    {w.status === "PENDING" ? (
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleAction(w.id, "PAID")}
                          disabled={loadingId === w.id}
                          className="btn-falcon-primary text-xs py-1 px-2.5 shadow-glow"
                        >
                          <Check className="w-3.5 h-3.5 text-black" />
                          Marcar Pagado
                        </button>
                        <button
                          onClick={() => handleAction(w.id, "REJECT")}
                          disabled={loadingId === w.id}
                          className="bg-rose-950/60 text-rose-400 border border-rose-800 px-2 py-1 rounded text-xs font-bold hover:bg-rose-900"
                        >
                          <X className="w-3.5 h-3.5" />
                          Rechazar
                        </button>
                      </div>
                    ) : (
                      <span className="text-[11px] text-slate-500 italic">Completado</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Banking Details Modal */}
      {selectedDetails && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h4 className="font-bold text-white text-base">Datos de Transferencia Bancaria</h4>
              <button onClick={() => setSelectedDetails(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-400">Titular:</span>
                  <strong className="text-white">{selectedDetails.details?.beneficiaryName}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Cuenta / PIX / CLABE:</span>
                  <strong className="font-mono text-cyan-400">{selectedDetails.details?.accountNumber}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">RUT / Tax ID:</span>
                  <strong className="font-mono text-slate-300">{selectedDetails.details?.taxId || "N/A"}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">País de Destino:</span>
                  <strong className="text-slate-300">{selectedDetails.details?.country}</strong>
                </div>
              </div>
            </div>

            <button
              onClick={() => setSelectedDetails(null)}
              className="mt-6 w-full btn-falcon-secondary py-2 text-xs justify-center"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
