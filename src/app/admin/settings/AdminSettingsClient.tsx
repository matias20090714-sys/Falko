"use client";

import React, { useState } from "react";
import { CheckCircle2, DollarSign, Save, Settings, ShieldCheck } from "lucide-react";

export function AdminSettingsClient({ initialSettings }: { initialSettings: Record<string, string> }) {
  const [settings, setSettings] = useState({
    platform_commission_uyu: initialSettings.platform_commission_uyu || "25",
    minimum_withdrawal_usd: initialSettings.minimum_withdrawal_usd || "20",
    default_guarantee_days: initialSettings.default_guarantee_days || "7",
    payment_provider: "MOCK",
    email_provider: "MOCK",
  });

  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState("");

  const handleSave = async (key: string, value: string) => {
    setSavingKey(key);
    setSuccessMsg("");
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value }),
      });

      const data = await res.json();
      if (data.success) {
        setSuccessMsg(`Parámetro "${key}" actualizado correctamente.`);
        setTimeout(() => setSuccessMsg(""), 3000);
      } else {
        alert(data.error || "Error al guardar parámetro.");
      }
    } catch {
      alert("Error de conexión.");
    } finally {
      setSavingKey(null);
    }
  };

  return (
    <div className="space-y-6">
      {successMsg && (
        <div className="bg-emerald-950/60 border border-emerald-500/60 text-emerald-300 text-xs p-3.5 rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-slate-800 space-y-6">
        {/* Setting 1: platform_commission_uyu */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <label className="text-sm font-bold text-white block">
              Comisión Fija de Plataforma FALKO (Base UYU)
            </label>
            <p className="text-xs text-slate-400 mt-0.5">
              Valor base en pesos uruguayos que se convierte automáticamente a la moneda de la transacción (USD, MXN, BRL, etc.).
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <input
                type="number"
                value={settings.platform_commission_uyu}
                onChange={(e) => setSettings({ ...settings, platform_commission_uyu: e.target.value })}
                className="w-28 px-3 py-2 rounded-xl glass-input text-xs font-mono font-bold text-cyan-400"
              />
            </div>
            <span className="text-xs text-slate-400 font-mono">UYU</span>
            <button
              onClick={() => handleSave("platform_commission_uyu", settings.platform_commission_uyu)}
              disabled={savingKey === "platform_commission_uyu"}
              className="btn-falcon-primary text-xs py-2 px-3"
            >
              <Save className="w-3.5 h-3.5" />
              Guardar
            </button>
          </div>
        </div>

        {/* Setting 2: minimum_withdrawal_usd */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <label className="text-sm font-bold text-white block">
              Monto Mínimo de Retiro (USD)
            </label>
            <p className="text-xs text-slate-400 mt-0.5">
              Saldo disponible mínimo requerido para que creadores y afiliados soliciten transferencias.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={settings.minimum_withdrawal_usd}
              onChange={(e) => setSettings({ ...settings, minimum_withdrawal_usd: e.target.value })}
              className="w-28 px-3 py-2 rounded-xl glass-input text-xs font-mono font-bold text-white"
            />
            <span className="text-xs text-slate-400 font-mono">USD</span>
            <button
              onClick={() => handleSave("minimum_withdrawal_usd", settings.minimum_withdrawal_usd)}
              disabled={savingKey === "minimum_withdrawal_usd"}
              className="btn-falcon-primary text-xs py-2 px-3"
            >
              <Save className="w-3.5 h-3.5" />
              Guardar
            </button>
          </div>
        </div>

        {/* Setting 3: default_guarantee_days */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <label className="text-sm font-bold text-white block">
              Días de Garantía por Defecto
            </label>
            <p className="text-xs text-slate-400 mt-0.5">
              Valor predeterminado al crear productos (Mínimo 7 días incondicional).
            </p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={settings.default_guarantee_days}
              onChange={(e) => setSettings({ ...settings, default_guarantee_days: e.target.value })}
              className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs font-mono"
            >
              <option value="7">7 Días</option>
              <option value="14">14 Días</option>
              <option value="30">30 Días</option>
            </select>
            <button
              onClick={() => handleSave("default_guarantee_days", settings.default_guarantee_days)}
              disabled={savingKey === "default_guarantee_days"}
              className="btn-falcon-primary text-xs py-2 px-3"
            >
              <Save className="w-3.5 h-3.5" />
              Guardar
            </button>
          </div>
        </div>

        {/* Payment & Email Connectors Overview */}
        <div className="pt-2 space-y-3">
          <h4 className="text-sm font-bold text-white">Conectores de Pasarela y Correo</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
              <span className="font-bold text-white block">Proveedor de Pagos Activo:</span>
              <span className="font-mono text-cyan-400 font-bold block mt-1">MOCK (Desarrollo Seguro)</span>
              <span className="text-[10px] text-slate-500 block mt-1">Stripe, Mercado Pago y PayPal listos para producción vía .env</span>
            </div>

            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
              <span className="font-bold text-white block">Proveedor de Emails Activo:</span>
              <span className="font-mono text-purple-400 font-bold block mt-1">MOCK / RESEND</span>
              <span className="text-[10px] text-slate-500 block mt-1">Plantillas registradas para compras, ventas y garantías</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
