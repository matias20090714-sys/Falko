"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Check,
  X,
  Zap,
  DollarSign,
  ShieldCheck,
  Globe,
  ArrowRight,
  TrendingUp,
  Sparkles,
  Layers,
  Rocket,
  Coins,
  Lock,
  Percent,
} from "lucide-react";
import { formatCurrency } from "@/lib/currency";

export function MigrateClient() {
  const [monthlySales, setMonthlySales] = useState(3000);

  // Fee Comparisons (Assuming average ticket of $30 USD -> 1 sale per $30 = monthlySales / 30 sales)
  // FALKO fee is fixed 25 UYU per sale (~$0.625 USD)
  const estimatedSalesCount = Math.max(1, Math.round(monthlySales / 30));
  const falkoFee = estimatedSalesCount * 0.625; // 25 UYU fixed (~$0.625 USD per sale)
  const hotmartFee = monthlySales * 0.16 + (estimatedSalesCount * 0.50); // ~9.9% + $0.50 per sale + FX conversion fees (~16%)
  const gumroadFee = monthlySales * 0.13 + (estimatedSalesCount * 0.30); // 10% + 2.9% stripe + $0.30 per sale
  const monthlySavings = Math.max(0, hotmartFee - falkoFee);

  const comparisonFeatures = [
    {
      feature: "Comisión de Plataforma",
      falko: "25 UYU Fija (~$0.63 USD por venta)",
      hotmart: "9.9% + $0.50 USD + FX (~16%)",
      gumroad: "10% + 2.9% pasarela + $0.30 (13-15%)",
      whop: "3% + costos de pasarela y banco",
    },
    {
      feature: "Retiros en Cripto Dólares (USDT / USDC)",
      falko: true,
      hotmart: false,
      gumroad: false,
      whop: false,
    },
    {
      feature: "Pagos Locales Inmediatos (PIX, SPEI, PSE, Prex)",
      falko: true,
      hotmart: false,
      gumroad: false,
      whop: false,
    },
    {
      feature: "Tiempo de Espera para Retirar Ganancias",
      falko: "7 días (Garantía) o Inmediato",
      hotmart: "30 a 45 días de retención",
      gumroad: "7 a 14 días (Solo pagos bancarios)",
      whop: "7 a 14 días",
    },
    {
      feature: "Recuperación de Carritos Abandonados Integrada",
      falko: "Gratis (Cupón 10% automático)",
      hotmart: "Herramienta externa requerida",
      gumroad: "No disponible de forma nativa",
      whop: "Requiere apps externas",
    },
    {
      feature: "Notificaciones de Prueba Social en Vivo",
      falko: "Incluido sin costo adicional",
      hotmart: "No incluido",
      gumroad: "No incluido",
      whop: "No incluido",
    },
    {
      feature: "Webhooks para CRM (Zapier / Make)",
      falko: "Nativo con firma HMAC",
      hotmart: "Complejo con retrasos",
      gumroad: "Básico",
      whop: "Básico",
    },
    {
      feature: "Sin Bloqueos Arbitrarios a Creadores Latinos",
      falko: true,
      hotmart: false,
      gumroad: false,
      whop: false,
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Hero Section */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 bg-cyan-950/80 text-cyan-300 border border-cyan-800/60 px-3 py-1 rounded-full text-xs font-mono">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>PORTAL DE MIGRACIÓN PARA CREADORES</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-heading font-black text-white leading-tight">
          ¿Vendes en Hotmart o Gumroad? <br />
          <span className="gradient-text-falcon">Pásate a FALKO y Aumenta tu Margen</span>
        </h1>
        <p className="text-sm sm:text-base text-slate-300">
          Comisiones más justas, retiros en Cripto USDT en 3 segundos, métodos de pago locales en toda Latinoamérica y herramientas de conversión de élite incluidas.
        </p>

        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <Link href="/seller/products/new" className="btn-falcon-primary py-3 px-8 text-xs font-bold shadow-glow flex items-center gap-2">
            <Rocket className="w-4 h-4" />
            <span>Publicar mi Producto en FALKO</span>
          </Link>
          <Link href="/seller/academy" className="btn-falcon-secondary py-3 px-6 text-xs text-slate-300 font-semibold">
            Ver Academia de Ventas
          </Link>
        </div>
      </div>

      {/* Savings Interactive Calculator */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-emerald-500/30 bg-slate-950/90 shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div>
            <span className="text-[10px] uppercase font-mono font-bold text-emerald-400">Calculadora de Ahorro</span>
            <h2 className="text-xl font-bold text-white">¿Cuánto más dinero ganarías con FALKO?</h2>
          </div>
          <div className="text-left sm:text-right">
            <span className="text-xs text-slate-400 block">Ventas mensuales estimadas</span>
            <span className="text-xl font-black font-mono text-cyan-300">${monthlySales.toLocaleString()} USD</span>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-2">
            Ajusta tu volumen de facturación mensual:
          </label>
          <input
            type="range"
            min={500}
            max={30000}
            step={500}
            value={monthlySales}
            onChange={(e) => setMonthlySales(Number(e.target.value))}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
            <span>$500 USD</span>
            <span>$10,000 USD</span>
            <span>$20,000 USD</span>
            <span>$30,000 USD</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="bg-slate-900/60 p-4 rounded-2xl border border-white/5 space-y-1">
            <span className="text-xs text-slate-400 block">En Hotmart pagarías en comisiones:</span>
            <span className="text-lg font-black font-mono text-rose-400">~${Math.round(hotmartFee).toLocaleString()} USD</span>
            <span className="text-[10px] text-slate-500 block">9.9% + fees ocultos de conversión FX</span>
          </div>

          <div className="bg-slate-900/60 p-4 rounded-2xl border border-white/5 space-y-1">
            <span className="text-xs text-slate-400 block">En Gumroad pagarías en comisiones:</span>
            <span className="text-lg font-black font-mono text-amber-400">~${Math.round(gumroadFee).toLocaleString()} USD</span>
            <span className="text-[10px] text-slate-500 block">10% + 2.9% procesador</span>
          </div>

          <div className="bg-emerald-950/40 p-4 rounded-2xl border border-emerald-500/40 space-y-1 shadow-glow">
            <span className="text-xs text-emerald-300 font-bold block">Tu ahorro mensual en FALKO:</span>
            <span className="text-2xl font-black font-mono text-emerald-400">+${Math.round(monthlySavings).toLocaleString()} USD</span>
            <span className="text-[10px] text-emerald-400/80 block">Más dinero directo en tu billetera</span>
          </div>
        </div>
      </div>

      {/* Comparison Matrix Table */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6 overflow-hidden">
        <div className="text-center max-w-xl mx-auto space-y-1">
          <span className="text-xs uppercase font-mono font-bold text-cyan-400">Comparativa Directa</span>
          <h2 className="text-2xl font-bold text-white">FALKO vs Otras Plataformas</h2>
          <p className="text-xs text-slate-400">Transparencia total sin comisiones ocultas.</p>
        </div>

        <div className="overflow-x-auto -mx-6 px-6 sm:mx-0 sm:px-0">
          <table className="w-full text-left border-collapse min-w-[650px]">
            <thead>
              <tr className="border-b border-white/10 text-xs">
                <th className="py-3 px-4 text-slate-400 font-semibold">Característica</th>
                <th className="py-3 px-4 text-cyan-300 font-bold bg-cyan-950/40 rounded-t-xl border-t border-cyan-500/30">
                  🦅 FALKO
                </th>
                <th className="py-3 px-4 text-slate-400 font-semibold">Hotmart</th>
                <th className="py-3 px-4 text-slate-400 font-semibold">Gumroad</th>
                <th className="py-3 px-4 text-slate-400 font-semibold">Whop</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs">
              {comparisonFeatures.map((row, idx) => (
                <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3.5 px-4 font-medium text-slate-200">{row.feature}</td>
                  <td className="py-3.5 px-4 font-bold text-cyan-300 bg-cyan-950/20">
                    {typeof row.falko === "boolean" ? (
                      row.falko ? (
                        <div className="flex items-center gap-1 text-emerald-400">
                          <Check className="w-4 h-4 stroke-[3]" />
                          <span>Sí</span>
                        </div>
                      ) : (
                        <X className="w-4 h-4 text-rose-400" />
                      )
                    ) : (
                      row.falko
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-slate-400">
                    {typeof row.hotmart === "boolean" ? (
                      row.hotmart ? <Check className="w-4 h-4 text-emerald-400" /> : <X className="w-4 h-4 text-rose-400" />
                    ) : (
                      row.hotmart
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-slate-400">
                    {typeof row.gumroad === "boolean" ? (
                      row.gumroad ? <Check className="w-4 h-4 text-emerald-400" /> : <X className="w-4 h-4 text-rose-400" />
                    ) : (
                      row.gumroad
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-slate-400">
                    {typeof row.whop === "boolean" ? (
                      row.whop ? <Check className="w-4 h-4 text-emerald-400" /> : <X className="w-4 h-4 text-rose-400" />
                    ) : (
                      row.whop
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Migration CTA Box */}
      <div className="glass-panel p-8 sm:p-10 rounded-3xl border border-cyan-500/40 bg-gradient-to-tr from-cyan-950/40 via-slate-950 to-purple-950/30 text-center space-y-4 shadow-2xl">
        <h2 className="text-2xl sm:text-3xl font-bold text-white">
          Comienza a Vender en FALKO Hoy Mismo
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto">
          Toma menos de 60 segundos subir tu primer producto. Sin tarifas mensuales fijas, solo pagas cuando vendes.
        </p>
        <div className="pt-2">
          <Link
            href="/seller/products/new"
            className="btn-falcon-primary py-3.5 px-8 text-sm font-bold shadow-glow inline-flex items-center gap-2"
          >
            <Rocket className="w-4 h-4" />
            <span>Crear mi Producto en 3 Pasos</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
