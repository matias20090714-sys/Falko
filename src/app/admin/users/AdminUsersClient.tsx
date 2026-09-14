"use client";

import React, { useState } from "react";
import { formatCurrency, COUNTRIES } from "@/lib/currency";
import { Search, ShieldAlert, ShieldCheck, UserX, UserCheck, X } from "lucide-react";

export function AdminUsersClient({ initialUsers }: { initialUsers: any[] }) {
  const [users, setUsers] = useState(initialUsers);
  const [search, setSearch] = useState("");
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const filteredUsers = users.filter((u) => {
    const q = search.toLowerCase();
    return (
      u.email.toLowerCase().includes(q) ||
      u.firstName.toLowerCase().includes(q) ||
      u.lastName.toLowerCase().includes(q) ||
      u.affiliateProfile?.affiliateCode?.toLowerCase().includes(q)
    );
  });

  const handleToggleSuspend = async (userId: string, isSuspended: boolean) => {
    let reason = "";
    if (!isSuspended) {
      reason = prompt("Ingresa el motivo de la suspensión administrativa:") || "";
      if (!reason) return;
    }

    setLoadingId(userId);
    try {
      const res = await fetch("/api/admin/users/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          action: isSuspended ? "UNSUSPEND" : "SUSPEND",
          reason,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, isSuspended: !isSuspended, suspensionReason: reason } : u))
        );
      } else {
        alert(data.error || "Error al actualizar usuario.");
      }
    } catch {
      alert("Error de conexión.");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="glass-panel rounded-2xl border border-slate-800 p-6 space-y-6">
      {/* Search Filter */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre, email o código de afiliado..."
            className="w-full pl-10 pr-4 py-2 rounded-xl glass-input text-xs"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
            <tr>
              <th className="py-3 px-3">Usuario</th>
              <th className="py-3 px-3">País</th>
              <th className="py-3 px-3">Roles</th>
              <th className="py-3 px-3 text-right">Saldo Disp.</th>
              <th className="py-3 px-3 text-right">En Garantía</th>
              <th className="py-3 px-3">Estado</th>
              <th className="py-3 px-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filteredUsers.map((u) => (
              <tr key={u.id} className="hover:bg-slate-900/30">
                <td className="py-3 px-3">
                  <span className="font-bold text-white block">{u.firstName} {u.lastName}</span>
                  <span className="text-[11px] text-slate-400 font-mono">{u.email}</span>
                  {u.affiliateProfile?.affiliateCode && (
                    <span className="text-[10px] text-purple-400 font-mono block">
                      Code: {u.affiliateProfile.affiliateCode}
                    </span>
                  )}
                </td>

                <td className="py-3 px-3">
                  <span className="text-sm">{COUNTRIES[u.countryCode]?.flag}</span>{" "}
                  <span className="text-slate-400 font-mono">{u.countryCode}</span>
                </td>

                <td className="py-3 px-3">
                  <div className="flex flex-wrap gap-1">
                    {u.roles.map((r: any) => (
                      <span
                        key={r.id}
                        className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                          r.role === "ADMIN"
                            ? "bg-rose-950 text-rose-300 border border-rose-800"
                            : r.role === "SELLER"
                            ? "bg-cyan-950 text-cyan-300 border border-cyan-800"
                            : r.role === "AFFILIATE"
                            ? "bg-purple-950 text-purple-300 border border-purple-800"
                            : "bg-slate-900 text-slate-400 border border-slate-700"
                        }`}
                      >
                        {r.role}
                      </span>
                    ))}
                  </div>
                </td>

                <td className="py-3 px-3 text-right font-mono font-bold text-emerald-400">
                  {formatCurrency(u.wallet?.availableBalance || 0, u.wallet?.currencyCode || "USD")}
                </td>

                <td className="py-3 px-3 text-right font-mono text-amber-400">
                  {formatCurrency(u.wallet?.pendingBalance || 0, u.wallet?.currencyCode || "USD")}
                </td>

                <td className="py-3 px-3">
                  {u.isSuspended ? (
                    <span className="bg-rose-950 text-rose-400 border border-rose-800 px-2 py-0.5 rounded text-[10px] font-bold" title={u.suspensionReason}>
                      Suspendido
                    </span>
                  ) : (
                    <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded text-[10px] font-bold">
                      Activo
                    </span>
                  )}
                </td>

                <td className="py-3 px-3 text-right">
                  <button
                    onClick={() => handleToggleSuspend(u.id, u.isSuspended)}
                    disabled={loadingId === u.id}
                    className={`text-xs px-2.5 py-1 rounded-lg font-bold border transition-colors ${
                      u.isSuspended
                        ? "bg-emerald-950/60 text-emerald-400 border-emerald-800 hover:bg-emerald-900"
                        : "bg-rose-950/40 text-rose-400 border-rose-800 hover:bg-rose-900"
                    }`}
                  >
                    {u.isSuspended ? "Reactivar" : "Suspender"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
