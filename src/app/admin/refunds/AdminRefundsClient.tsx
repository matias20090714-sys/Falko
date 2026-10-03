"use client";

import React, { useState } from "react";
import { formatCurrency } from "@/lib/currency";
import { CheckCircle2, XCircle, Clock, ShieldAlert, Check, X, MessageSquare, AlertTriangle } from "lucide-react";

export function AdminRefundsClient({ initialRefunds }: { initialRefunds: any[] }) {
  const [refunds, setRefunds] = useState(initialRefunds);
  const [filter, setFilter] = useState<"ALL" | "REQUESTED" | "APPROVED" | "REJECTED">("REQUESTED");
  const [selectedRefund, setSelectedRefund] = useState<any | null>(null);
  const [modalAction, setModalAction] = useState<"APPROVE" | "REJECT" | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const filteredRefunds = refunds.filter((r) => {
    if (filter === "ALL") return true;
    return r.status === filter;
  });

  const openActionModal = (refund: any, action: "APPROVE" | "REJECT") => {
    setSelectedRefund(refund);
    setModalAction(action);
    setAdminNotes(action === "APPROVE" ? "Reembolso aprobado dentro del plazo de garantía." : "Solicitud de reembolso denegada.");
  };

  const closeModal = () => {
    setSelectedRefund(null);
    setModalAction(null);
    setAdminNotes("");
  };

  const handleConfirmAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRefund || !modalAction) return;

    setLoading(true);
    try {
      const res = await fetch("/api/admin/refunds/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          refundId: selectedRefund.id,
          action: modalAction,
          notes: adminNotes,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setRefunds((prev) =>
          prev.map((r) =>
            r.id === selectedRefund.id
              ? {
                  ...r,
                  status: modalAction === "APPROVE" ? "APPROVED" : "REJECTED",
                  adminNotes,
                  processedAt: new Date().toISOString(),
                }
              : r
          )
        );
        closeModal();
      } else {
        alert(data.error || "Error al procesar la solicitud de reembolso.");
      }
    } catch {
      alert("Error de conexión al procesar el reembolso.");
    } finally {
      setLoading(false);
    }
  };

  const pendingCount = refunds.filter((r) => r.status === "REQUESTED").length;
  const approvedCount = refunds.filter((r) => r.status === "APPROVED").length;
  const rejectedCount = refunds.filter((r) => r.status === "REJECTED").length;

  return (
    <div className="space-y-6">
      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 glass-panel p-4 rounded-2xl border border-white/10">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setFilter("REQUESTED")}
            className={`text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-2 transition-all ${
              filter === "REQUESTED"
                ? "bg-amber-950/80 text-amber-300 border border-amber-500/40 shadow-glow"
                : "text-slate-400 hover:text-white bg-slate-900/60"
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>Pendientes ({pendingCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setFilter("APPROVED")}
            className={`text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-2 transition-all ${
              filter === "APPROVED"
                ? "bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 shadow-glow"
                : "text-slate-400 hover:text-white bg-slate-900/60"
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Aprobados ({approvedCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setFilter("REJECTED")}
            className={`text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-2 transition-all ${
              filter === "REJECTED"
                ? "bg-rose-950/80 text-rose-300 border border-rose-500/40 shadow-glow"
                : "text-slate-400 hover:text-white bg-slate-900/60"
            }`}
          >
            <XCircle className="w-3.5 h-3.5 text-rose-400" />
            <span>Rechazados ({rejectedCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setFilter("ALL")}
            className={`text-xs font-bold px-3.5 py-2 rounded-xl transition-all ${
              filter === "ALL"
                ? "bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 shadow-glow"
                : "text-slate-400 hover:text-white bg-slate-900/60"
            }`}
          >
            Todos ({refunds.length})
          </button>
        </div>
      </div>

      {filteredRefunds.length === 0 ? (
        <div className="glass-panel rounded-3xl p-12 text-center border border-white/10 my-6">
          <ShieldAlert className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-base font-bold text-white mb-1">Sin reembolsos en esta categoría</h3>
          <p className="text-xs text-slate-400">
            No se encontraron solicitudes de reembolso con el filtro seleccionado.
          </p>
        </div>
      ) : (
        <div className="glass-panel rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-slate-400 uppercase text-[10px] tracking-wider bg-slate-950/80 border-b border-white/10">
                <tr>
                  <th className="py-3.5 px-4">Orden #</th>
                  <th className="py-3.5 px-4">Comprador</th>
                  <th className="py-3.5 px-4">Producto</th>
                  <th className="py-3.5 px-4">Explicación / Razon del Cliente</th>
                  <th className="py-3.5 px-4 text-right">Monto</th>
                  <th className="py-3.5 px-4">Estado</th>
                  <th className="py-3.5 px-4 text-right">Decisión Manual</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredRefunds.map((r) => {
                  const isPending = r.status === "REQUESTED";
                  const isApproved = r.status === "APPROVED";
                  const isRejected = r.status === "REJECTED";

                  return (
                    <tr key={r.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="py-4 px-4 font-mono font-bold text-white whitespace-nowrap">
                        #{r.order?.orderNumber}
                      </td>

                      <td className="py-4 px-4">
                        <span className="font-bold text-white block">
                          {r.buyer?.firstName} {r.buyer?.lastName}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">{r.buyer?.email}</span>
                      </td>

                      <td className="py-4 px-4 text-slate-200 max-w-xs font-semibold">
                        {r.order?.items?.[0]?.product?.title || "Producto Digital"}
                      </td>

                      <td className="py-4 px-4 max-w-md">
                        <div className="bg-slate-950/80 p-2.5 rounded-xl border border-white/5 text-slate-300 text-xs leading-relaxed">
                          <span className="text-[10px] font-bold text-cyan-400 block mb-0.5 flex items-center gap-1">
                            <MessageSquare className="w-3 h-3" /> Razon declarada:
                          </span>
                          "{r.reason}"
                        </div>
                        {r.adminNotes && (
                          <div className="mt-1.5 text-[11px] text-slate-400 italic">
                            <strong className="text-slate-300">Nota Admin:</strong> {r.adminNotes}
                          </div>
                        )}
                      </td>

                      <td className="py-4 px-4 text-right font-mono font-bold text-rose-400 whitespace-nowrap text-sm">
                        {formatCurrency(r.amount, r.currencyCode)}
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap">
                        {isPending && (
                          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-950/80 text-amber-300 border border-amber-500/40 inline-flex items-center gap-1">
                            <Clock className="w-3 h-3 text-amber-400" />
                            Pendiente
                          </span>
                        )}
                        {isApproved && (
                          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            Aprobado
                          </span>
                        )}
                        {isRejected && (
                          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-rose-950/80 text-rose-300 border border-rose-500/40 inline-flex items-center gap-1">
                            <XCircle className="w-3 h-3 text-rose-400" />
                            Rechazado
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-4 text-right whitespace-nowrap">
                        {isPending ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => openActionModal(r, "APPROVE")}
                              className="btn-falcon-primary text-xs py-1.5 px-3 font-bold shadow-glow flex items-center gap-1"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Aprobar</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => openActionModal(r, "REJECT")}
                              className="bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-500/40 text-xs py-1.5 px-3 rounded-xl font-bold transition-all flex items-center gap-1"
                            >
                              <X className="w-3.5 h-3.5" />
                              <span>Rechazar</span>
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-500 font-semibold italic">
                            Resuelto ({new Date(r.updatedAt || r.processedAt || Date.now()).toLocaleDateString()})
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Decision Modal */}
      {selectedRefund && modalAction && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/10 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                {modalAction === "APPROVE" ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                ) : (
                  <XCircle className="w-5 h-5 text-rose-400" />
                )}
                <h3 className="text-base font-bold text-white">
                  {modalAction === "APPROVE" ? "Aprobar Reembolso de Garantía" : "Rechazar Reembolso de Garantía"}
                </h3>
              </div>
              <button onClick={closeModal} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Buyer & Order Details */}
            <div className="bg-slate-950/80 rounded-2xl p-4 border border-white/10 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Orden #:</span>
                <span className="font-mono font-bold text-white">#{selectedRefund.order?.orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Comprador:</span>
                <span className="font-bold text-white">
                  {selectedRefund.buyer?.firstName} {selectedRefund.buyer?.lastName} ({selectedRefund.buyer?.email})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Monto Afectado:</span>
                <span className="font-mono font-bold text-rose-400">
                  {formatCurrency(selectedRefund.amount, selectedRefund.currencyCode)}
                </span>
              </div>
              <div className="pt-2 border-t border-white/5 space-y-1">
                <strong className="text-cyan-400 block font-bold">Razón explicada por el comprador:</strong>
                <p className="text-slate-300 italic bg-slate-900/90 p-2.5 rounded-xl border border-white/5 leading-relaxed">
                  "{selectedRefund.reason}"
                </p>
              </div>
            </div>

            {modalAction === "APPROVE" ? (
              <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-2xl p-3.5 text-xs text-emerald-300 leading-relaxed flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  Al aprobar, el sistema ejecutará el reverso contable en la billetera del vendedor, cancelará la comisión del afiliado y revocará inmediatamente las descargas al cliente.
                </span>
              </div>
            ) : (
              <div className="bg-rose-950/40 border border-rose-500/30 rounded-2xl p-3.5 text-xs text-rose-300 leading-relaxed flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>
                  Al rechazar, el comprador mantendrá su acceso al producto y no se deducirá saldo del vendedor.
                </span>
              </div>
            )}

            <form onSubmit={handleConfirmAction} className="space-y-4">
              <div>
                <label className="block text-xs text-slate-300 font-semibold mb-1.5">
                  Notas de Administración / Respuesta al Comprador:
                </label>
                <textarea
                  required
                  rows={3}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Escribe las notas explicativas de tu decisión..."
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="btn-falcon-secondary text-xs py-2 px-4"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={
                    modalAction === "APPROVE"
                      ? "btn-falcon-primary text-xs py-2 px-5 font-bold shadow-glow"
                      : "bg-rose-600 hover:bg-rose-500 text-white text-xs py-2 px-5 font-bold rounded-xl transition-colors"
                  }
                >
                  {loading ? "Procesando..." : modalAction === "APPROVE" ? "Confirmar Aprobación" : "Confirmar Rechazo"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
