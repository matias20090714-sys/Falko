"use client";

import React, { useState } from "react";
import { ChevronDown, HelpCircle, Sparkles } from "lucide-react";

export function LandingFaq() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqs = [
    {
      q: "¿Por qué FALKO solo cobra 25 UYU fija por venta?",
      a: "Creemos que los creadores deben conservar sus ganancias. Eliminamos los porcentajes abusivos del 10% al 18% de plataformas tradicionales y cobramos una tarifa plana fija de 25 UYU (pesos uruguayos o su equivalente de ~$0.63 USD) sin mensualidades ni costes de mantenimiento.",
    },
    {
      q: "¿Cómo cobro el dinero de mis ventas en mi país?",
      a: "Soportamos retiros locales a cuentas bancarias en Argentina (CBU/Mercado Pago), Brasil (PIX), México (SPEI), Colombia (PSE/Bancolombia), Uruguay (Prex/BROU) y retiros globales instantáneos en Cripto USDT/USDC (redes Solana y Polygon con 0% comisión).",
    },
    {
      q: "¿Puedo vender si no tengo experiencia técnica?",
      a: "¡Totalmente! Diseñamos el 'Modo Asistente Rápido' en 3 pasos: defines tu título, subes tu archivo o pegas tu enlace de Notion/Drive, fijas tu precio y tu página de venta queda lista al instante con pasarelas de pago globales.",
    },
    {
      q: "¿Cómo funciona el sistema de afiliados?",
      a: "Tú decides si quieres permitir afiliados en cada producto y qué porcentaje otorgar (desde el 5% hasta el 80%). FALKO rastrea las ventas mediante cookies y enlaces seguros, y divide los pagos de forma 100% automática.",
    },
    {
      q: "¿Cómo se protegen los compradores y los archivos?",
      a: "Todos los productos cuentan con garantía protegida de satisfacción (de 7 a 30 días). Los archivos y videos se custodian en nuestra Bóveda Digital con enlaces cifrados temporales para evitar la piratería.",
    },
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
        <div className="inline-flex items-center gap-2 bg-slate-900/90 text-cyan-400 border border-white/10 px-3 py-1 rounded-full text-xs font-mono font-bold">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>PREGUNTAS FRECUENTES</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-heading font-black text-white">
          Todo lo que necesitas saber
        </h2>
        <p className="text-xs sm:text-sm text-slate-400">
          Transparencia total para creadores, afiliados y compradores de todo el mundo.
        </p>
      </div>

      <div className="space-y-3">
        {faqs.map((faq, idx) => {
          const isOpen = openIdx === idx;
          return (
            <div
              key={idx}
              className={`glass-panel border transition-all duration-200 overflow-hidden ${
                isOpen ? "border-cyan-500/40 bg-slate-950/90 shadow-glow" : "border-white/5 bg-slate-950/50"
              }`}
            >
              <button
                type="button"
                onClick={() => setOpenIdx(isOpen ? null : idx)}
                className="w-full p-5 text-left flex items-center justify-between gap-4 cursor-pointer"
              >
                <span className="text-sm sm:text-base font-bold text-white leading-snug">
                  {faq.q}
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-cyan-400 shrink-0 transition-transform duration-200 ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isOpen && (
                <div className="px-5 pb-5 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-white/5 pt-3 animate-in fade-in duration-150">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
