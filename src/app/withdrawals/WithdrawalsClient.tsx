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

  const currencyCode = wallet?.currencyCode || "USD";
  const availableBalance = parseFloat((wallet?.availableBalance || 0).toFixed(2));
  const pendingBalance = parseFloat((wallet?.pendingBalance || 0).toFixed(2));
  const totalBalance = parseFloat((wallet?.totalBalance || 0).toFixed(2));

  const parsedAmount = parseFloat(amount) || 0;
  const isOverBalance = parsedAmount > availableBalance;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) {
      setError("Ingresa un monto válido mayor a 0.");
      return;
    }

    if (numAmount > availableBalance) {
      setError(`Solo puedes retirar tu saldo disponible (${formatCurrency(availableBalance, currencyCode)}). No puedes solicitar ni un centavo más.`);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/withdrawals/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: parseFloat(numAmount.toFixed(2)),
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
        setSuccessMsg(`¡Solicitud #${data.withdrawalNumber} registrada exitosamente por ${formatCurrency(numAmount, currencyCode)}!`);
        setAmount("");
        setAccountNumber("");
        setTaxId("");
        router.refresh();
      } else {
        setError(data.error || "Error al solicitar retiro.");
      }
    } catch {
      setError("Error de conexión con el servidor.");
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
    <div className="space-y-8">
      {/* 3 Top Summary Balance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Available to Withdraw */}
        <div className="glass-panel rounded-2xl p-5 border border-emerald-500/50 bg-emerald-950/20 shadow-glow space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-emerald-300 font-bold flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              <span>Saldo Disponible (Retirable Hoy)</span>
            </span>
            <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-bold">
              100% Retirable
            </span>
          </div>
          <div className="text-3xl font-black font-mono text-emerald-400">
            {formatCurrency(availableBalance, currencyCode)}
          </div>
          <p className="text-[11px] text-slate-300">
            Este es el <strong>único saldo</strong> que puedes retirar hoy a tu cuenta.
          </p>
        </div>

        {/* Pending Guarantee */}
        <div className="glass-panel rounded-2xl p-5 border border-amber-500/30 bg-amber-950/10 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-amber-300 font-bold flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-amber-400" />
              <span>Retenido en Garantía</span>
            </span>
            <span className="text-[10px] bg-amber-950 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full font-bold">
              No Retirable Aún
            </span>
          </div>
          <div className="text-3xl font-black font-mono text-amber-400">
            {formatCurrency(pendingBalance, currencyCode)}
          </div>
          <p className="text-[11px] text-slate-400">
            Protegido durante el período de garantía de compra (7 a 30 días).
          </p>
        </div>

        {/* Total Ledger Balance */}
        <div className="glass-panel rounded-2xl p-5 border border-white/10 bg-slate-950/40 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold">
              Balance Total Acumulado
            </span>
            <span className="text-[10px] text-slate-500 font-mono">
              Disponible + Retenido
            </span>
          </div>
          <div className="text-3xl font-black font-mono text-white">
            {formatCurrency(totalBalance, currencyCode)}
          </div>
          <p className="text-[11px] text-slate-500">
            Total bruto en tu cuenta antes de transferencias.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Column (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSubmit} className="glass-panel rounded-2xl p-6 sm:p-8 border border-slate-800 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Building2 className="w-4 h-4 text-cyan-400" />
                Datos de Transferencia para Retiro
              </h3>
              <span className="text-xs font-mono bg-emerald-950/80 border border-emerald-500/40 px-3 py-1 rounded-xl text-emerald-300">
                Máximo permitido: <strong className="font-bold text-white">{formatCurrency(availableBalance, currencyCode)}</strong>
              </span>
            </div>

            {error && (
              <div className="bg-rose-950/80 border border-rose-500/50 text-rose-200 text-xs p-3.5 rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {successMsg && (
              <div className="bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 text-xs p-3.5 rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Zero balance alert */}
            {availableBalance <= 0 && (
              <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/40 text-xs text-amber-200 space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-amber-300">
                  <Lock className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>No tienes saldo disponible para retirar en este momento ({formatCurrency(0, currencyCode)})</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Solo puedes retirar fondos que figuren en <strong>Saldo Disponible</strong>. Si tienes ingresos retenidos en garantía, estos se transferirán automáticamente a tu saldo disponible una vez vencido el período de garantía de cada compra.
                </p>
              </div>
            )}

            {/* Amount field */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-slate-300">
                  Monto a Retirar ({currencyCode}) *
                </label>
                {availableBalance > 0 && (
                  <button
                    type="button"
                    onClick={() => setAmount(availableBalance.toFixed(2))}
                    className="text-[11px] text-cyan-400 hover:text-cyan-300 font-bold hover:underline"
                  >
                    Retirar Todo Disponible ({formatCurrency(availableBalance, currencyCode)})
                  </button>
                )}
              </div>

              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  required
                  disabled={availableBalance <= 0}
                  min="0.01"
                  max={availableBalance}
                  value={amount}
                  onChange={(e) => {
                    setAmount(e.target.value);
                    if (error) setError("");
                  }}
                  placeholder={availableBalance > 0 ? "0.00" : "0.00 (Sin saldo disponible)"}
                  className={`w-full px-3.5 py-3 rounded-xl glass-input text-lg font-mono font-black ${
                    isOverBalance
                      ? "border-rose-500 text-rose-400 bg-rose-950/30"
                      : "text-emerald-400"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                />
              </div>

              {isOverBalance ? (
                <p className="text-[11px] text-rose-400 font-bold flex items-center gap-1 pt-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>
                    El monto ({formatCurrency(parsedAmount, currencyCode)}) supera tu saldo disponible ({formatCurrency(availableBalance, currencyCode)}). Solo puedes retirar hasta {formatCurrency(availableBalance, currencyCode)}, ni un centavo más.
                  </span>
                </p>
              ) : (
                <p className="text-[11px] text-slate-400">
                  Monto máximo que puedes retirar: <strong className="text-emerald-400">{formatCurrency(availableBalance, currencyCode)}</strong> (Solo tu saldo disponible).
                </p>
              )}
            </div>

            {/* Method selector based on Country */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Método de Pago para {countryInfo.name} *
              </label>
              <select
                value={selectedMethod}
                onChange={(e) => setSelectedMethod(e.target.value)}
                disabled={availableBalance <= 0}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-cyan-400 font-semibold disabled:opacity-50"
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
                  Número de Cuenta / CLABE / Chave PIX / CVU / CBU / IBAN *
                </label>
                <input
                  type="text"
                  required
                  disabled={availableBalance <= 0}
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder="1234-5678-9012 o alias/CVU"
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs font-mono disabled:opacity-50"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Documento de Identidad / RUT / CPF / Tax ID / DNI
                </label>
                <input
                  type="text"
                  disabled={availableBalance <= 0}
                  value={taxId}
                  onChange={(e) => setTaxId(e.target.value)}
                  placeholder="12.345.678-9"
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs font-mono disabled:opacity-50"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Nombre del Titular de la Cuenta / Beneficiario *
              </label>
              <input
                type="text"
                required
                disabled={availableBalance <= 0}
                value={beneficiaryName}
                onChange={(e) => setBeneficiaryName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs disabled:opacity-50"
              />
            </div>

            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 text-[11px] text-slate-400 flex items-start gap-2">
              <Lock className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
              <span>Tus datos financieros viajan encriptados y solo son accesibles por tesorería para emitir el pago.</span>
            </div>

            <button
              type="submit"
              disabled={loading || availableBalance <= 0 || isOverBalance || parsedAmount <= 0}
              className="w-full btn-falcon-primary py-3.5 text-sm font-bold justify-center shadow-glow disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              {loading
                ? "Procesando Solicitud..."
                : availableBalance <= 0
                ? `Sin Saldo Disponible para Retirar (${formatCurrency(0, currencyCode)})`
                : isOverBalance
                ? "Monto Excede tu Saldo Disponible"
                : `Confirmar Retiro (${formatCurrency(parsedAmount > 0 ? parsedAmount : availableBalance, currencyCode)})`}
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
  </div>
  );
}
