"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, Users, Zap, X } from "lucide-react";

interface SocialProofEvent {
  type: "purchase" | "viewers";
  name?: string;
  city?: string;
  country?: string;
  flag?: string;
  productTitle?: string;
  minutesAgo?: number;
  viewersCount?: number;
}

const SAMPLE_PURCHASES: SocialProofEvent[] = [
  {
    type: "purchase",
    name: "Mateo R.",
    city: "Santiago",
    country: "Chile",
    flag: "🇨🇱",
    productTitle: "Master Prompts para Creadores con IA",
    minutesAgo: 3,
  },
  {
    type: "viewers",
    viewersCount: 16,
  },
  {
    type: "purchase",
    name: "Rodrigo M.",
    city: "Montevideo",
    country: "Uruguay",
    flag: "🇺🇾",
    productTitle: "Next.js SaaS Boilerplate Ultra",
    minutesAgo: 7,
  },
  {
    type: "purchase",
    name: "Camila S.",
    city: "São Paulo",
    country: "Brasil",
    flag: "🇧🇷",
    productTitle: "Embudo High-Ticket Automatizado",
    minutesAgo: 11,
  },
  {
    type: "viewers",
    viewersCount: 24,
  },
  {
    type: "purchase",
    name: "Alejandro G.",
    city: "Ciudad de México",
    country: "México",
    flag: "🇲🇽",
    productTitle: "Guía de Automatizaciones No-Code",
    minutesAgo: 14,
  },
  {
    type: "purchase",
    name: "Lucas B.",
    city: "Buenos Aires",
    country: "Argentina",
    flag: "🇦🇷",
    productTitle: "Master Prompts para Creadores con IA",
    minutesAgo: 19,
  },
];

export function LiveSocialProof() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (dismissed) return;

    // Show initial notification after 3 seconds
    const initialTimer = setTimeout(() => {
      setIsVisible(true);
    }, 3000);

    // Rotate every 12 seconds
    const interval = setInterval(() => {
      setIsVisible(false);

      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % SAMPLE_PURCHASES.length);
        setIsVisible(true);
      }, 1000);
    }, 11000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, [dismissed]);

  if (dismissed) return null;

  const currentEvent = SAMPLE_PURCHASES[currentIndex];
  if (!currentEvent) return null;

  return (
    <div
      className={`fixed bottom-20 sm:bottom-5 left-4 right-4 sm:right-auto sm:left-5 z-40 max-w-sm transition-all duration-500 transform ${
        isVisible
          ? "translate-y-0 opacity-100 scale-100 pointer-events-auto"
          : "translate-y-8 opacity-0 scale-95 pointer-events-none"
      }`}
    >
      <div className="bg-slate-900/95 backdrop-blur-2xl border border-white/15 rounded-2xl p-3.5 shadow-2xl flex items-start gap-3 relative overflow-hidden group">
        {/* Glow Line Top */}
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-400 via-purple-500 to-emerald-400" />

        {currentEvent.type === "purchase" ? (
          <>
            <div className="w-10 h-10 rounded-xl bg-cyan-950/90 border border-cyan-500/40 flex items-center justify-center text-cyan-300 shrink-0 text-base shadow-sm">
              {currentEvent.flag || "⚡"}
            </div>
            <div className="flex-1 min-w-0 pr-4">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-white">
                <span>{currentEvent.name}</span>
                <span className="text-slate-400 font-normal">de {currentEvent.city}</span>
              </div>
              <p className="text-[11px] text-cyan-300 font-semibold truncate leading-tight mt-0.5">
                Compró {currentEvent.productTitle}
              </p>
              <span className="text-[9px] text-slate-400 font-mono flex items-center gap-1 mt-0.5">
                <Sparkles className="w-2.5 h-2.5 text-cyan-400" /> Hace {currentEvent.minutesAgo} minutos • Verificado
              </span>
            </div>
          </>
        ) : (
          <>
            <div className="w-10 h-10 rounded-xl bg-purple-950/90 border border-purple-500/40 flex items-center justify-center text-purple-300 shrink-0 shadow-sm">
              <Users className="w-5 h-5 text-purple-400" />
            </div>
            <div className="flex-1 min-w-0 pr-4">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-white">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Alta demanda en vivo</span>
              </div>
              <p className="text-[11px] text-purple-300 font-semibold leading-tight mt-0.5">
                {currentEvent.viewersCount} personas están explorando productos ahora
              </p>
              <span className="text-[9px] text-slate-400 font-mono block mt-0.5">
                Garantía protegida FALKO 7-30 días
              </span>
            </div>
          </>
        )}

        {/* Close Button */}
        <button
          onClick={() => setDismissed(true)}
          className="absolute top-2 right-2 text-slate-500 hover:text-white p-1 rounded-md transition-colors"
          title="Cerrar notificación"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
