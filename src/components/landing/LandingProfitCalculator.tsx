"use client";

import React, { useState, useEffect } from "react";
import { formatCurrency, calculatePlatformFee, CURRENCY_RATES } from "@/lib/currency";
import { Calculator, Sparkles, TrendingUp, CheckCircle, ArrowRight } from "lucide-react";
import Link from "next/link";

export function LandingProfitCalculator() {
  const [productPrice, setProductPrice] = useState(35);
  const [salesPerMonth, setSalesPerMonth] = useState(50);
  const [currency, setCurrency] = useState("USD");

  useEffect(() => {
    const saved = localStorage.getItem("falko_currency");
    if (saved && CURRENCY_RATES[saved]) {
      setCurrency(saved);
    }

    const handleCurrencyChange = (e: any) => {
      if (e.detail && CURRENCY_RATES[e.detail]) {
        setCurrency(e.detail);
      }
    };

    window.addEventListener("currencyChange", handleCurrencyChange);
    return () => window.removeEventListener("currencyChange", handleCurrencyChange);
  }, []);

  const totalGross = productPrice * salesPerMonth;
  const platformFee = calculatePlatformFee(currency, 25);
  const totalFalkoFees = platformFee.feeConverted * salesPerMonth;
  const falkoNetEarnings = Math.max(0, totalGross - totalFalkoFees);

  // Competitor estimations
  const hotmartFees = totalGross * 0.16 + salesPerMonth * 0.5;
  const hotmartNet = Math.max(0, totalGross - hotmartFees);

  const extraMoneyWithFalko = Math.max(0, falkoNetEarnings - hotmartNet);

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-cyan-500/30 bg-gradient-to-b from-slate-950/90 via-slate-950 to-slate-950 shadow-2xl relative overflow-hidden">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <div className="inline-flex items-center gap-2 bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 px-3 py-1 rounded-full text-xs font-mono font-bold">
            <Calculator className="w-3.5 h-3.5 text-cyan-400" />
            <span>SIMULADOR DE GANANCIAS EN TIEMPO REAL</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-heading font-black text-white">
            Calcula cuánto dinero extra ganas en FALKO
          </h2>
          <p className="text-xs sm:text-sm text-slate-300">
            Descubre tu beneficio neto con la tarifa fija de <strong>25 UYU</strong> por venta frente a las comisiones del 15% al 18% de otras plataformas.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Sliders Control Panel */}
          <div className="space-y-6 bg-slate-900/60 p-6 rounded-2xl border border-white/5">
            {/* Price Slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-300">Precio promedio de tu producto:</span>
                <span className="font-mono font-black text-cyan-400 text-sm">
                  {formatCurrency(productPrice, currency)}
                </span>
              </div>
              <input
                type="range"
                min="5"
                max="500"
                step="5"
                value={productPrice}
                onChange={(e) => setProductPrice(parseFloat(e.target.value))}
                className="w-full accent-cyan-400 h-2 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

            {/* Sales Volume Slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-300">Ventas estimadas por mes:</span>
                <span className="font-mono font-black text-purple-300 text-sm">
                  {salesPerMonth} ventas
                </span>
              </div>
              <input
                type="range"
                min="5"
                max="1000"
                step="5"
                value={salesPerMonth}
                onChange={(e) => setSalesPerMonth(parseInt(e.target.value))}
                className="w-full accent-purple-400 h-2 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

            <div className="pt-2 border-t border-white/5 text-[11px] text-slate-400 flex items-center gap-2">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Facturación mensual bruta: {formatCurrency(totalGross, currency)}</span>
            </div>
          </div>

          {/* Results Comparison Card */}
          <div className="bg-gradient-to-br from-cyan-950/50 via-slate-900/80 to-slate-950 p-6 sm:p-7 rounded-2xl border border-cyan-500/40 space-y-4 shadow-glow">
            <div>
              <span className="text-[10px] uppercase font-mono font-bold text-slate-400 block mb-1">
                Tu Ganancia Neta Mensual
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-black font-mono text-emerald-400">
                  {formatCurrency(falkoNetEarnings, currency)}
                </span>
                <span className="text-xs text-slate-400 font-mono">/ mes</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-white/10 space-y-2 text-xs">
              <div className="flex justify-between text-slate-300">
                <span>En Hotmart recibirías:</span>
                <span className="font-mono text-slate-400">{formatCurrency(hotmartNet, currency)}</span>
              </div>
              <div className="flex justify-between text-emerald-400 font-bold pt-1 border-t border-white/5">
                <span>¡Ganancia extra en tu bolsillo!</span>
                <span className="font-mono">+{formatCurrency(extraMoneyWithFalko, currency)}</span>
              </div>
            </div>

            <Link
              href="/seller/products/new"
              className="btn-falcon-primary w-full py-3 text-xs font-bold text-center flex items-center justify-center gap-2 shadow-glow"
            >
              <Sparkles className="w-4 h-4" />
              <span>Empezar a Vender con 25 UYU Fijo</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
