"use client";

import React, { useState } from "react";
import { 
  HelpCircle, 
  ChevronDown, 
  DollarSign,
  ShieldCheck,
  Sparkles,
  Users
} from "lucide-react";

interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: "ventas" | "pagos" | "afiliados" | "general";
  icon: any;
}

const FAQS: FaqItem[] = [
  {
    id: "costos",
    question: "¿Tiene algún costo mensual o mantenimiento usar Falko?",
    answer: "No. En Falko no pagas ninguna suscripción mensual ni costo fijo. Es 100% gratis registrarte, publicar productos y afiliarte. Solo se descuenta una pequeña tarifa transparente (10%) cuando realizas una venta efectiva.",
    category: "ventas",
    icon: DollarSign,
  },
  {
    id: "sin-producto",
    question: "¿Puedo ganar dinero si no tengo un producto propio?",
    answer: "¡Totalmente! Puedes unirte como Afiliado, explorar el Marketplace, elegir productos con altas comisiones (hasta 80%) y compartir tu enlace exclusivo. Cada vez que alguien compre con tu enlace, la comisión se deposita al instante en tu billetera de Falko.",
    category: "afiliados",
    icon: Users,
  },
  {
    id: "como-cobro",
    question: "¿Cómo y cuándo cobro mis ganancias en mi país?",
    answer: "Puedes solicitar retiros directamente a tu cuenta bancaria local (Uruguay, Argentina, México, Colombia, Chile, Perú, etc.) o en USDT cripto. Los fondos se procesan entre 12 a 24 horas hábiles una vez finalizado el período de garantía de la venta.",
    category: "pagos",
    icon: ShieldCheck,
  },
  {
    id: "subir-producto",
    question: "¿Qué tipo de productos digitales puedo vender?",
    answer: "Cursos online en video, Ebooks en PDF, plantillas de Notion o Excel, consultorías 1 a 1, software, audios, membresías y cualquier contenido descargable o de acceso web. Falko protege tus archivos y los entrega automáticamente a tus clientes al pagar.",
    category: "ventas",
    icon: Sparkles,
  },
  {
    id: "soporte",
    question: "¿Qué pasa si mis compradores tienen dudas antes de comprar?",
    answer: "Cada producto incluye un botón directo de WhatsApp para que tus clientes puedan chatear contigo en 1 clic y cerrar ventas más rápido. Además, puedes generar códigos QR para historias de Instagram, TikTok y folletos físicos.",
    category: "general",
    icon: HelpCircle,
  },
];

export default function FalkoQuickFaq() {
  const [openId, setOpenId] = useState<string | null>("costos");

  const toggle = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800/80 backdrop-blur-xl rounded-2xl p-6 sm:p-8 shadow-xl">
      <div className="flex items-center gap-3 mb-6 border-b border-slate-800 pb-4">
        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
          <HelpCircle className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">Preguntas Frecuentes y Guía Rápida</h3>
          <p className="text-slate-400 text-xs sm:text-sm">
            Respuestas directas sin términos complicados para vender con total seguridad.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {FAQS.map((faq) => {
          const isOpen = openId === faq.id;
          const IconComponent = faq.icon;
          return (
            <div
              key={faq.id}
              className={`rounded-xl border transition-all duration-200 overflow-hidden ${
                isOpen 
                  ? "bg-slate-950/70 border-indigo-500/30 shadow-md" 
                  : "bg-slate-950/40 border-slate-800/60 hover:border-slate-700/80"
              }`}
            >
              <button
                onClick={() => toggle(faq.id)}
                className="w-full flex items-center justify-between p-4 text-left gap-4"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${isOpen ? "bg-indigo-500/20 text-indigo-400" : "bg-slate-800/60 text-slate-400"}`}>
                    <IconComponent className="w-4 h-4" />
                  </div>
                  <span className="text-sm sm:text-base font-semibold text-white">
                    {faq.question}
                  </span>
                </div>
                <ChevronDown 
                  className={`w-5 h-5 text-slate-400 transition-transform duration-200 shrink-0 ${
                    isOpen ? "rotate-180 text-indigo-400" : ""
                  }`} 
                />
              </button>

              {isOpen && (
                <div className="px-4 pb-4 pt-1 text-sm text-slate-300 leading-relaxed border-t border-slate-800/50 pl-12">
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
