"use client";

import React, { useState } from "react";
import { 
  Landmark, 
  Banknote, 
  Sparkles, 
  ChevronDown, 
  ShieldCheck,
  Zap,
  Globe
} from "lucide-react";

interface CountryPayoutInfo {
  code: string;
  name: string;
  flag: string;
  currency: string;
  channels: string[];
  minWithdrawal: string;
  processingTime: string;
  instructions: string;
  popular: boolean;
}

const COUNTRIES: CountryPayoutInfo[] = [
  {
    code: "UY",
    name: "Uruguay",
    flag: "🇺🇾",
    currency: "UYU / USD",
    channels: ["BROU", "Santander", "Itaú", "Prex Uruguay", "MiDinero", "Transferencia Bancaria"],
    minWithdrawal: "$10 USD",
    processingTime: "12 a 24 horas hábiles",
    instructions: "Recibes directo en tu cuenta bancaria o tarjeta prepaga en pesos uruguayos o dólares al tipo de cambio oficial interbancario sin comisiones ocultas.",
    popular: true,
  },
  {
    code: "AR",
    name: "Argentina",
    flag: "🇦🇷",
    currency: "ARS / USDT",
    channels: ["Mercado Pago", "CBU / CVU Bancario", "Brubank", "Ualá", "USDT (BEP-20)"],
    minWithdrawal: "$10 USD",
    processingTime: "Instantáneo a 6 horas",
    instructions: "Retira a tu CVU/CBU o en USDT cripto directo para protegerte de la inflación con la mejor cotización libre.",
    popular: true,
  },
  {
    code: "MX",
    name: "México",
    flag: "🇲🇽",
    currency: "MXN",
    channels: ["SPEI Bancario (CLABE)", "BBVA", "Banamex", "Santander", "Mercado Pago"],
    minWithdrawal: "$10 USD",
    processingTime: "Mismo día hábil",
    instructions: "Transferencia directa por SPEI a cualquier tarjeta de débito o cuenta de 18 dígitos CLABE.",
    popular: true,
  },
  {
    code: "CO",
    name: "Colombia",
    flag: "🇨🇴",
    currency: "COP",
    channels: ["Nequi", "Daviplata", "Bancolombia", "PSE Transferencia"],
    minWithdrawal: "$10 USD",
    processingTime: "12 a 24 horas hábiles",
    instructions: "Retira directamente a tu número Nequi o cuenta corriente/ahorros Bancolombia.",
    popular: true,
  },
  {
    code: "CL",
    name: "Chile",
    flag: "🇨🇱",
    currency: "CLP",
    channels: ["Cuenta RUT BancoEstado", "Santander Chile", "Banco de Chile", "Mach"],
    minWithdrawal: "$10 USD",
    processingTime: "24 horas hábiles",
    instructions: "Aceptamos todas las cuentas bancarias nacionales incluyendo Cuenta RUT.",
    popular: false,
  },
  {
    code: "PE",
    name: "Perú",
    flag: "🇵🇪",
    currency: "PEN / USD",
    channels: ["Yape", "Plin", "BCP", "Interbank", "BBVA Perú"],
    minWithdrawal: "$10 USD",
    processingTime: "24 horas hábiles",
    instructions: "Transferencias directas a cuentas de ahorros BCP/Interbank o mediante billeteras móviles.",
    popular: false,
  },
  {
    code: "USDT",
    name: "Cripto / Global (USDT)",
    flag: "🌐",
    currency: "USDT / USDC",
    channels: ["Binance", "Trust Wallet", "Metamask", "Red Polygon", "Red Binance Smart Chain (BEP20)"],
    minWithdrawal: "$15 USD",
    processingTime: "Automático / < 30 minutos",
    instructions: "Ideal para cualquier país del mundo. Recibe dólares digitales estables directamente en tu wallet sin bancos intermediarios.",
    popular: true,
  },
];

export default function CountryWithdrawalsGuide() {
  const [selectedCountry, setSelectedCountry] = useState<string>("UY");
  const [openAccordion, setOpenAccordion] = useState<boolean>(true);

  const active = COUNTRIES.find((c) => c.code === selectedCountry) || COUNTRIES[0];

  return (
    <div className="bg-slate-900/80 border border-slate-800/80 backdrop-blur-xl rounded-2xl p-6 sm:p-8 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
              <Zap className="w-3.5 h-3.5" /> Retiros Claros y Directos
            </span>
          </div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Banknote className="w-6 h-6 text-emerald-400" />
            ¿Cómo cobro mis ganancias en mi país?
          </h3>
          <p className="text-slate-400 text-sm mt-1">
            En Falko retiras tus comisiones como productor o afiliado a tu moneda local o en dólares.
          </p>
        </div>

        <button 
          onClick={() => setOpenAccordion(!openAccordion)}
          className="text-xs text-slate-400 hover:text-white flex items-center gap-1 bg-slate-800/60 px-3 py-1.5 rounded-lg border border-slate-700/50 transition-colors w-fit"
        >
          {openAccordion ? "Ocultar guía rápida" : "Ver guía rápida"}
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${openAccordion ? "rotate-180" : ""}`} />
        </button>
      </div>

      {openAccordion && (
        <>
          {/* Country Selector Pills */}
          <div className="flex flex-wrap gap-2 mb-6">
            {COUNTRIES.map((country) => {
              const isSelected = selectedCountry === country.code;
              return (
                <button
                  key={country.code}
                  onClick={() => setSelectedCountry(country.code)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isSelected
                      ? "bg-emerald-500 text-slate-950 font-bold shadow-lg shadow-emerald-500/20 scale-[1.02]"
                      : "bg-slate-800/60 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/40"
                  }`}
                >
                  <span className="text-base">{country.flag}</span>
                  <span>{country.name}</span>
                  {country.popular && !isSelected && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Active Country Detail Box */}
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-5 sm:p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{active.flag}</span>
                <div>
                  <h4 className="text-lg font-bold text-white flex items-center gap-2">
                    Retiros en {active.name}
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Moneda: {active.currency}
                    </span>
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Tiempo estimado de pago: <strong className="text-slate-200">{active.processingTime}</strong>
                  </p>
                </div>
              </div>

              <p className="text-sm text-slate-300 leading-relaxed bg-slate-900/50 p-3.5 rounded-lg border border-slate-800/60">
                {active.instructions}
              </p>

              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2">
                  Métodos y Bancos Habilitados:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {active.channels.map((chan, idx) => (
                    <span 
                      key={idx}
                      className="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-800/80 text-emerald-300 border border-slate-700/60"
                    >
                      {chan}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Guarantees / Minimums */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-950 p-4 rounded-xl border border-slate-800/80 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4" /> Garantía de Pago
                </div>
                
                <div className="space-y-2 text-xs text-slate-300">
                  <div className="flex justify-between py-1.5 border-b border-slate-800/80">
                    <span className="text-slate-400">Mínimo de retiro:</span>
                    <strong className="text-emerald-400">{active.minWithdrawal}</strong>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-800/80">
                    <span className="text-slate-400">Comisión por retiro:</span>
                    <strong className="text-white">$0 USD (Gratis)</strong>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-slate-400">Seguridad:</span>
                    <strong className="text-slate-200">Verificación 2FA</strong>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/60">
                <p className="text-[11px] text-slate-400">
                  💡 Solo ingresa tus datos en la pestaña de solicitud de retiro y nuestro sistema procesará la transferencia automáticamente.
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
