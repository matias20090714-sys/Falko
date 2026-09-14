"use client";

import React, { useState } from "react";
import Link from "next/link";
import { formatCurrency } from "@/lib/currency";
import { Check, Search, ShieldAlert, ShieldCheck, X } from "lucide-react";

export function AdminProductsClient({ initialProducts }: { initialProducts: any[] }) {
  const [products, setProducts] = useState(initialProducts);
  const [search, setSearch] = useState("");
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const filtered = products.filter((p) => {
    const q = search.toLowerCase();
    return p.title.toLowerCase().includes(q) || p.seller.firstName.toLowerCase().includes(q) || p.seller.email.toLowerCase().includes(q);
  });

  const handleAction = async (productId: string, action: "APPROVE" | "REJECT" | "SUSPEND") => {
    let reason = "";
    if (action !== "APPROVE") {
      reason = prompt(`Ingresa el motivo para ${action.toLowerCase()} el producto:`) || "";
      if (!reason) return;
    }

    setLoadingId(productId);
    try {
      const res = await fetch("/api/admin/products/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, action, reason }),
      });

      const data = await res.json();
      if (data.success) {
        setProducts((prev) =>
          prev.map((p) => (p.id === productId ? { ...p, status: data.status, rejectionReason: reason } : p))
        );
      } else {
        alert(data.error || "Error al actualizar estado del producto.");
      }
    } catch {
      alert("Error de conexión.");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="glass-panel rounded-2xl border border-slate-800 p-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por título o vendedor..."
            className="w-full pl-10 pr-4 py-2 rounded-xl glass-input text-xs"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
            <tr>
              <th className="py-3 px-3">Producto</th>
              <th className="py-3 px-3">Vendedor</th>
              <th className="py-3 px-3">Categoría</th>
              <th className="py-3 px-3 text-right">Precio</th>
              <th className="py-3 px-3 text-right">Ventas</th>
              <th className="py-3 px-3">Estado</th>
              <th className="py-3 px-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filtered.map((p) => (
              <tr key={p.id} className="hover:bg-slate-900/30">
                <td className="py-3 px-3 max-w-xs">
                  <span className="font-bold text-white block truncate">{p.title}</span>
                  <Link href={`/product/${p.slug}`} target="_blank" className="text-[11px] text-cyan-400 hover:underline">
                    Ver página pública ↗
                  </Link>
                </td>

                <td className="py-3 px-3">
                  <span className="font-bold text-white block">{p.seller.firstName} {p.seller.lastName}</span>
                  <span className="text-[10px] text-slate-400 font-mono">{p.seller.email}</span>
                </td>

                <td className="py-3 px-3 text-slate-300">
                  {p.category?.name}
                </td>

                <td className="py-3 px-3 text-right font-mono font-bold text-cyan-400">
                  {formatCurrency(p.price, p.currencyCode)}
                </td>

                <td className="py-3 px-3 text-right font-mono text-white">
                  {p.salesCount}
                </td>

                <td className="py-3 px-3">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                      p.status === "APPROVED"
                        ? "bg-emerald-950 text-emerald-400 border-emerald-800"
                        : p.status === "SUSPENDED"
                        ? "bg-rose-950 text-rose-400 border-rose-800"
                        : "bg-amber-950 text-amber-400 border-amber-800"
                    }`}
                    title={p.rejectionReason}
                  >
                    {p.status}
                  </span>
                </td>

                <td className="py-3 px-3 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    {p.status !== "APPROVED" && (
                      <button
                        onClick={() => handleAction(p.id, "APPROVE")}
                        disabled={loadingId === p.id}
                        className="bg-emerald-950/60 text-emerald-400 border border-emerald-800 px-2 py-1 rounded text-xs font-bold hover:bg-emerald-900"
                      >
                        Aprobar
                      </button>
                    )}
                    {p.status !== "SUSPENDED" && (
                      <button
                        onClick={() => handleAction(p.id, "SUSPEND")}
                        disabled={loadingId === p.id}
                        className="bg-rose-950/40 text-rose-400 border border-rose-800 px-2 py-1 rounded text-xs font-bold hover:bg-rose-900"
                      >
                        Suspender
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
