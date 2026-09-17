"use client";

import React, { useState, useEffect } from "react";
import { calculatePlatformFee, formatCurrency, CURRENCY_RATES } from "@/lib/currency";
import { Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";

export function LandingSellerFeePill() {
  const [currency, setCurrency] = useState("USD");

  useEffect(() => {
    const saved = localStorage.getItem("falko_currency");
    if (saved && CURRENCY_RATES[saved]) {
      setCurrency(saved);
    } else {
      try {
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
        if (tz.includes("Montevideo")) setCurrency("UYU");
        else if (tz.includes("Argentina") || tz.includes("Buenos_Aires")) setCurrency("ARS");
        else if (tz.includes("Sao_Paulo") || tz.includes("Brazil")) setCurrency("BRL");
        else if (tz.includes("Mexico")) setCurrency("MXN");
        else if (tz.includes("Bogota")) setCurrency("COP");
        else if (tz.includes("Santiago")) setCurrency("CLP");
        else if (tz.includes("Lima")) setCurrency("PEN");
        else if (tz.includes("Madrid") || tz.includes("Europe")) setCurrency("EUR");
      } catch (e) {}
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
    <div className="pt-2 flex items-center gap-1.5 text-cyan-400 text-[11px] font-semibold">
      <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
      <span>
        Tarifa plana de {isUyu ? "25 UYU" : `${formatCurrency(fee.feeConverted, currency)} (~25 UYU)`}
      </span>
    </div>
  );
}

export function LandingMigrationSection() {
  const [currency, setCurrency] = useState("USD");

  useEffect(() => {
    const saved = localStorage.getItem("falko_currency");
    if (saved && CURRENCY_RATES[saved]) {
      setCurrency(saved);
    } else {
      try {
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
        if (tz.includes("Montevideo")) setCurrency("UYU");
        else if (tz.includes("Argentina") || tz.includes("Buenos_Aires")) setCurrency("ARS");
        else if (tz.includes("Sao_Paulo") || tz.includes("Brazil")) setCurrency("BRL");
        else if (tz.includes("Mexico")) setCurrency("MXN");
        else if (tz.includes("Bogota")) setCurrency("COP");
        else if (tz.includes("Santiago")) setCurrency("CLP");
        else if (tz.includes("Lima")) setCurrency("PEN");
        else if (tz.includes("Madrid") || tz.includes("Europe")) setCurrency("EUR");
      } catch (e) {}
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
  const formattedFee = isUyu ? "25 UYU" : `${formatCurrency(fee.feeConverted, currency)}`;

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-amber-500/30 bg-gradient-to-br from-amber-950/20 via-slate-950 to-slate-950 flex flex-col lg:flex-row items-center justify-between gap-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="space-y-4 max-w-2xl text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-950/80 border border-amber-500/40 text-amber-300 text-xs font-mono font-bold">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>¿VENDES EN HOTMART, GUMROAD O CLICKBANK?</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-heading font-black text-white">
            Pásate a FALKO y Aumenta tu Margen de Ganancia
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Conserva el máximo de dinero de cada venta. En FALKO la única comisión de la plataforma es una{" "}
            <strong>tarifa fija de {formattedFee} {!isUyu && "(25 UYU)"}</strong> por venta sin importar el precio de tu producto, sin mensualidades y con cobros en tu moneda local o Cripto USDT.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-left">
            <div className="bg-slate-900/80 p-3 rounded-xl border border-white/5">
              <span className="text-[10px] text-slate-400 font-mono block">Tarifa FALKO ({currency})</span>
              <span className="text-xs font-bold text-emerald-400 font-mono">
                {formattedFee} Fija
              </span>
            </div>
            <div className="bg-slate-900/80 p-3 rounded-xl border border-white/5">
              <span className="text-[10px] text-slate-400 font-mono block">Retiros Locales</span>
              <span className="text-xs font-bold text-cyan-400">PIX, SPEI, PSE, MP</span>
            </div>
            <div className="bg-slate-900/80 p-3 rounded-xl border border-white/5 col-span-2 sm:col-span-1">
              <span className="text-[10px] text-slate-400 font-mono block">Velocidad</span>
              <span className="text-xs font-bold text-purple-300">Pagos Inmediatos</span>
            </div>
          </div>
        </div>

        <div className="shrink-0 flex flex-col sm:flex-row lg:flex-col gap-3 w-full lg:w-auto">
          <Link
            href="/migrate"
            className="btn-falcon-primary text-xs py-3.5 px-8 shadow-glow font-bold flex items-center justify-center gap-2 text-center"
          >
            <Sparkles className="w-4 h-4" />
            <span>Ver Calculadora de Migración</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/register"
            className="btn-falcon-secondary text-xs py-3 px-6 text-center text-slate-300"
          >
            Crear Cuenta y Empezar
          </Link>
        </div>
      </div>
    </section>
  );
}
