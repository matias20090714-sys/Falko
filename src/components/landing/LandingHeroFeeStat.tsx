"use client";

import React, { useState, useEffect } from "react";
import { calculatePlatformFee, formatCurrency, CURRENCY_RATES } from "@/lib/currency";

export function LandingHeroFeeStat() {
  const [currency, setCurrency] = useState("USD");

  useEffect(() => {
    // 1. Check saved currency
    const saved = localStorage.getItem("falko_currency");
    if (saved && CURRENCY_RATES[saved]) {
      setCurrency(saved);
    } else {
      // 2. Auto-detect from timezone
      try {
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
        if (tz.includes("Montevideo")) setCurrency("UYU");
        else if (tz.includes("Argentina") || tz.includes("Buenos_Aires")) setCurrency("ARS");
        else if (tz.includes("Sao_Paulo") || tz.includes("Brazil") || tz.includes("Fortaleza")) setCurrency("BRL");
        else if (tz.includes("Mexico") || tz.includes("Monterrey") || tz.includes("Cancun")) setCurrency("MXN");
        else if (tz.includes("Bogota")) setCurrency("COP");
        else if (tz.includes("Santiago")) setCurrency("CLP");
        else if (tz.includes("Lima")) setCurrency("PEN");
        else if (tz.includes("Madrid") || tz.includes("Europe")) setCurrency("EUR");
      } catch (e) {
        // fallback to USD
      }
    }

    const handleCurrencyChange = (e: any) => {
      if (e.detail && CURRENCY_RATES[e.detail]) {
        setCurrency(e.detail);
      }
    };

    window.addEventListener("currencyChange", handleCurrencyChange);
    return () => window.removeEventListener("currencyChange", handleCurrencyChange);
  }, []);

  const fee = calculatePlatformFee(currency, 25);
  const isUyu = currency === "UYU";

  return (
    <div className="glass-panel p-3.5 rounded-2xl border border-cyan-500/20 bg-slate-950/80 shadow-glow transition-all duration-300">
      <span className="text-[10px] uppercase font-bold text-cyan-400 block font-mono">
        Tarifa Base ({currency})
      </span>
      <div className="flex items-baseline gap-1 mt-0.5">
        <span className="text-sm font-black font-mono text-cyan-300">
          {isUyu ? "25 UYU Fijo" : `~${formatCurrency(fee.feeConverted, currency)}`}
        </span>
      </div>
      {!isUyu && (
        <span className="text-[9px] text-slate-400 font-mono block">
          Equivalente a 25 UYU fija
        </span>
      )}
    </div>
  );
}
