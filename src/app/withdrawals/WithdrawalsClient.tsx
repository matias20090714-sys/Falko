"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { formatCurrency, CountryInfo } from "@/lib/currency";
import {
  AlertCircle,
  Building2,
  CheckCircle2,
  Clock,
  DollarSign,
  History,
  Lock,
  Send,
  ShieldCheck,
} from "lucide-react";

interface WithdrawalsClientProps {
  wallet: any;
  withdrawals: any[];
  countryInfo: CountryInfo;
  currentUser: any;
}

export function WithdrawalsClient({
  wallet,
  withdrawals: initialWithdrawals,
  countryInfo,
  currentUser,
}: WithdrawalsClientProps) {
  const router = useRouter();

  const [withdrawals, setWithdrawals] = useState(initialWithdrawals);
  const [selectedMethod, setSelectedMethod] = useState(countryInfo.withdrawalMethods[0] || "Transferencia Bancaria");
  const [amount, setAmount] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [beneficiaryName, setBeneficiaryName] = useState(`${currentUser.firstName} ${currentUser.lastName}`);
  const [taxId, setTaxId] = useState(""); // RUT, CPF, RFC, SSN depending on country
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const availableBalance = wallet?.availableBalance || 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) {
      setError("Ingresa un monto válido.");
      return;
    }

    if (numAmount > availableBalance) {
      setError(`El monto excede tu saldo disponible (${formatCurrency(availableBalance, wallet?.currencyCode || "USD")}).`);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/withdrawals/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: numAmount,
          methodType: selectedMethod,
          accountDetails: {
            methodName: selectedMethod,
            accountNumber,
            beneficiaryName,
            taxId,
            country: countryInfo.name,
          },
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSuccessMsg(`¡Solicitud #${data.withdrawalNumber} registrada exitosamente!`);
        setAmount("");
        setAccountNumber("");
        setTaxId("");
        router.refresh();
      } else {
        setError(data.error || "Error al solicitar retiro.");
      }
    } catch {
      setError("Error de conexión.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PAID":
        return <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded text-[10px] font-bold">✓ Pagado</span>;
      case "PROCESSING":
        return <span className="bg-blue-950 text-blue-400 border border-blue-800 px-2 py-0.5 rounded text-[10px] font-bold">En Proceso</span>;
      case "REJECTED":
        return <span className="bg-rose-950 text-rose-400 border border-rose-800 px-2 py-0.5 rounded text-[10px] font-bold">✗ Rechazado</span>;
      case "PENDING":
      default:
        return <span className="bg-amber-950 text-amber-400 border border-amber-800 px-2 py-0.5 rounded text-[10px] font-bold">Pendiente Revisión</span>;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Form Column (2 Cols) */}
      <div className="lg:col-span-2 space-y-6">
        <form onSubmit={handleSubmit} className="glass-panel rounded-2xl p-6 sm:p-8 border border-slate-800 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <Building2 className="w-4 h-4 text-cyan-400" />
              Datos de Transferencia Local
            </h3>
            <span className="text-xs text-slate-400 font-mono">
              Saldo Retirable: <strong className="text-emerald-400 font-bold">{formatCurrency(availableBalance, wallet?.currencyCode || "USD")}</strong>
            </span>
          </div>

          {error && (
            <div className="bg-rose-950/60 border border-rose-800 text-rose-300 text-xs p-3.5 rounded-xl">
              {error}
            </div>
          )}

          {successMsg && (
            <div className="bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs p-3.5 rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Amount field */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-slate-300">Monto a Retirar ({wallet?.currencyCode || "USD"}) *</label>
              <button
                type="button"
                onClick={() => setAmount(availableBalance.toString())}
                className="text-[11px] text-cyan-400 hover:underline"
              >
                Retirar Todo Disponible
              </button>
            </div>
            <input
              type="number"
              step="0.01"
              required
              min="1"
              max={availableBalance}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs font-mono font-bold text-lg text-emerald-400"
            />
          </div>

          {/* Method selector based on Country */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Método de Pago para {countryInfo.name} *</label>
            <select
              value={selectedMethod}
              onChange={(e) => setSelectedMethod(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-cyan-400 font-semibold"
            >
              {countryInfo.withdrawalMethods.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          {/* Account Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Número de Cuenta / CLABE / Chave PIX / IBAN *
              </label>
              <input
                type="text"
                required
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder="1234-5678-9012"
                className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Documento de Identidad / RUT / CPF / Tax ID
              </label>
              <input
                type="text"
                value={taxId}
                onChange={(e) => setTaxId(e.target.value)}
                placeholder="12.345.678-9"
                className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs font-mono"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Nombre del Titular de la Cuenta *</label>
            <input
              type="text"
              required
              value={beneficiaryName}
              onChange={(e) => setBeneficiaryName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs"
            />
          </div>

          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 text-[11px] text-slate-400 flex items-start gap-2">
            <Lock className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
            <span>Tus datos financieros viajan encriptados y solo son accesibles por tesorería para emitir el pago.</span>
          </div>

          <button
            type="submit"
            disabled={loading || availableBalance <= 0}
            className="w-full btn-falcon-primary py-3 text-sm font-bold justify-center shadow-glow disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            {loading ? "Procesando Solicitud..." : "Confirmar Solicitud de Retiro"}
          </button>
        </form>
      </div>

      {/* History Column (1 Col) */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
        <h3 className="font-bold text-white text-base pb-3 border-b border-slate-800 flex items-center gap-2">
          <History className="w-4 h-4 text-cyan-400" />
          Historial de Retiros
        </h3>

        {withdrawals.length === 0 ? (
          <div className="text-center py-10 text-slate-500 text-xs">
            Aún no has realizado solicitudes de retiro.
          </div>
        ) : (
          <div className="space-y-3">
            {withdrawals.map((w) => (
              <div
                key={w.id}
                className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5 text-xs space-y-1.5"
              >
                <div className="flex justify-between items-center">
                  <span className="font-mono font-bold text-white">#{w.withdrawalNumber}</span>
                  {getStatusBadge(w.status)}
                </div>

                <div className="flex justify-between items-baseline pt-1">
                  <span className="text-[11px] text-slate-400 truncate max-w-[140px]">
                    {w.withdrawalMethod?.methodType}
                  </span>
                  <span className="font-mono font-bold text-emerald-400 text-sm">
                    {formatCurrency(w.amount, w.currencyCode)}
                  </span>
                </div>

                <div className="text-[10px] text-slate-500 font-mono">
                  {new Date(w.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
