"use client";

import React, { useState } from "react";
import { COUNTRIES, formatCurrency } from "@/lib/currency";
import { Check, CheckCircle2, Share2, Users, X, XCircle } from "lucide-react";

export function SellerAffiliatesClient({ initialRequests }: { initialRequests: any[] }) {
  const [requests, setRequests] = useState(initialRequests);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleAction = async (affiliateProductId: string, action: "APPROVE" | "REJECT") => {
    setLoadingId(affiliateProductId);
    try {
      const res = await fetch("/api/seller/affiliates/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ affiliateProductId, action }),
      });

      const data = await res.json();
      if (data.success) {
        setRequests((prev) =>
          prev.map((r) => (r.id === affiliateProductId ? { ...r, status: data.status } : r))
        );
      } else {
        alert(data.error || "No se pudo procesar la acción.");
      }
    } catch {
      alert("Error de conexión.");
    } finally {
      setLoadingId(null);
    }
  };

  if (requests.length === 0) {
    return (
      <div className="glass-panel rounded-2xl p-12 text-center border border-slate-800">
        <Users className="w-12 h-12 text-slate-600 mx-auto mb-4" />
        <h3 className="text-base font-bold text-white mb-1">Sin solicitudes pendientes</h3>
        <p className="text-xs text-slate-400">
          Cuando un afiliado solicite autorización para promocionar tus productos de aprobación manual, aparecerá listado aquí.
        </p>
      </div>
    );
  }

  return (
    <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
      <div className="divide-y divide-slate-800">
        {requests.map((req) => {
          const affUser = req.affiliateProfile.user;

          return (
            <div
              key={req.id}
              className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-900/40 transition-colors"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center font-bold text-white text-xs border border-slate-700">
                  {affUser.firstName[0]}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">
                      {affUser.firstName} {affUser.lastName}
                    </span>
                    <span className="font-mono text-[10px] text-purple-400 bg-purple-950 px-1.5 py-0.2 rounded border border-purple-800">
                      {req.affiliateProfile.affiliateCode}
                    </span>
                    <span>{COUNTRIES[affUser.countryCode]?.flag}</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Producto solicitado: <strong className="text-slate-200">{req.product.title}</strong>
                  </p>
                  <span className="text-[10px] text-slate-500 font-mono">
                    Solicitado el {new Date(req.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Status & Actions */}
              <div className="flex items-center gap-2 shrink-0">
                {req.status === "PENDING" ? (
                  <>
                    <button
                      onClick={() => handleAction(req.id, "APPROVE")}
                      disabled={loadingId === req.id}
                      className="btn-falcon-primary text-xs py-1.5 px-3 shadow-glow"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Aprobar
                    </button>
                    <button
                      onClick={() => handleAction(req.id, "REJECT")}
                      disabled={loadingId === req.id}
                      className="bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 border border-rose-800 text-xs py-1.5 px-3 rounded-lg"
                    >
                      <X className="w-3.5 h-3.5" />
                      Rechazar
                    </button>
                  </>
                ) : (
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-md border ${
                      req.status === "APPROVED"
                        ? "bg-emerald-950 text-emerald-400 border-emerald-800"
                        : "bg-rose-950 text-rose-400 border-rose-800"
                    }`}
                  >
                    {req.status === "APPROVED" ? "✓ Aprobado" : "✗ Rechazado"}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
