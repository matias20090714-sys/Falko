"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  GraduationCap,
  Rocket,
  Zap,
  CheckCircle2,
  DollarSign,
  ArrowRight,
  Sparkles,
  Share2,
  MessageSquare,
  ShieldCheck,
  Video,
  Copy,
  Check,
  Award,
  Users,
  TrendingUp,
} from "lucide-react";

export function AcademyClient() {
  const [copiedScript, setCopiedScript] = useState<string | null>(null);

  const copyScript = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedScript(id);
    setTimeout(() => setCopiedScript(null), 2000);
  };

  const steps = [
    {
      number: "01",
      icon: Sparkles,
      title: "Empaqueta tu Conocimiento en 30 Minutos",
      subtitle: "No necesitas ser un experto técnico para vender tu primer producto.",
      content: [
        "Elige uno de los 4 formatos de mayor venta: Ebook en PDF, Masterclass en Video, Pack de Prompts IA o Plantilla de Notion/Excel.",
        "Resuelve un problema específico y claro (ej: 'Cómo crear anuncios que convierten' o 'Plantilla de control de finanzas personales').",
        "Exporta tu archivo en formato PDF, ZIP o copia el enlace de tu plantilla pública.",
      ],
      action: {
        label: "Ver Plantillas Listas para Usar",
        href: "/seller/products/new",
      },
    },
    {
      number: "02",
      icon: Zap,
      title: "Sube tu Producto a FALKO en 3 Pasos",
      subtitle: "Usa nuestro nuevo Asistente Rápido en 60 segundos.",
      content: [
        "Selecciona el tipo de producto en el Asistente Rápido para autocompletar la estructura.",
        "Elige una portada de alta resolución de nuestra galería de 1-clic o sube tu propia imagen.",
        "Define tu precio en USD (recomendado para principiantes: entre $19 y $49 USD para maximizar volumen).",
      ],
      action: {
        label: "Subir mi Producto Ahora",
        href: "/seller/products/new",
      },
    },
    {
      number: "03",
      icon: Share2,
      title: "Estrategia de Venta Directa (WhatsApp e Instagram)",
      subtitle: "Cómo generar tus primeras 5 a 10 ventas sin invertir en publicidad.",
      content: [
        "Copia el enlace directo de tu producto o checkout desde tu panel de vendedor.",
        "Publica una historia o video corto mostrando el resultado que genera tu producto (ej: 'Creé esta plantilla que me ahorra 3 horas al día, coméntame PLANTILLA y te paso el link').",
        "Envía el enlace de compra a quienes te respondan usando nuestros guiones de venta probados.",
      ],
      action: {
        label: "Ir a Panel de Ventas",
        href: "/seller",
      },
    },
    {
      number: "04",
      icon: Users,
      title: "Activa tu Ejército de Afiliados",
      subtitle: "Deja que otros creadores promocionen tu producto por una comisión.",
      content: [
        "Activa la opción de afiliados en tu producto y ofrece entre 20% y 50% de comisión.",
        "Los afiliados de FALKO verán tu producto en el catálogo de afiliación y compartirán su enlace único.",
        "FALKO calcula y reparte las ganancias automáticamente en cada venta sin que tengas que hacer cálculos manuales.",
      ],
      action: {
        label: "Gestionar Afiliados",
        href: "/seller/affiliates",
      },
    },
  ];

  const scripts = [
    {
      id: "script-whatsapp",
      title: "Guión de Cierre Rápido por WhatsApp / DM de Instagram",
      text: "¡Hola [Nombre]! 👋 Vi que te interesó [Nombre del Producto]. Te preparé acceso exclusivo con garantía de devolución protegida por FALKO por 7 días. Puedes ingresar y descargarlo directamente aquí: [Tu Enlace de Checkout FALKO]. ¡Cualquier duda me avisas y te ayudo personalmente!",
    },
    {
      id: "script-story",
      title: "Guión para Historias de Instagram / TikTok",
      text: "🔥 Muchos me estuvieron preguntando cómo logré [Resultado Deseado]. Decidí empaquetar todo mi método paso a paso en [Nombre del Producto]. Ya está disponible en la plataforma FALKO con precio especial de lanzamiento. Toca el enlace de mi biografía o coméntame 'QUIERO' para enviarte el link directo.",
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header Banner */}
      <div className="glass-panel p-8 sm:p-10 rounded-3xl border border-cyan-500/30 bg-gradient-to-br from-slate-950 via-cyan-950/20 to-slate-950 shadow-2xl relative overflow-hidden">
        <div className="max-w-2xl space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-bold text-cyan-400 font-mono tracking-wider">
              Academia de Creadores FALKO
            </span>
            <span className="text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-800 px-2 py-0.5 rounded-full font-mono">
              GUÍA PASO A PASO
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-heading font-black text-white leading-tight">
            Aprende a Crear, Publicar y Vender Productos Digitales
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            Esta guía te enseñará exactamente cómo monetizar tu conocimiento, generar tus primeras ventas y escalar tus ingresos en dólares digitales con FALKO.
          </p>

          <div className="flex flex-wrap gap-3 pt-3">
            <Link href="/seller/products/new" className="btn-falcon-primary text-xs py-2.5 px-5 shadow-glow flex items-center gap-2 font-bold">
              <Rocket className="w-4 h-4" />
              <span>Subir mi Primer Producto</span>
            </Link>
            <Link href="/seller" className="btn-falcon-secondary text-xs py-2.5 px-4 text-slate-300">
              Ir a mi Panel de Ventas
            </Link>
          </div>
        </div>
      </div>

      {/* 4 Steps Roadmap */}
      <div className="space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-1">
          <span className="text-xs uppercase font-bold text-cyan-400 font-mono">El Camino del Creador</span>
          <h2 className="text-2xl font-bold text-white">4 Pasos para Lograr tus Primeras Ventas</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.number}
                className="glass-panel p-6 rounded-3xl border border-white/10 hover:border-cyan-500/40 bg-slate-900/40 transition-all flex flex-col justify-between space-y-4 group shadow-xl"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-2xl bg-cyan-950/90 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:bg-cyan-500 group-hover:text-slate-950 transition-colors">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-2xl font-black font-mono text-slate-700 group-hover:text-cyan-500/40 transition-colors">
                      {step.number}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-xs text-slate-400">{step.subtitle}</p>

                  <ul className="space-y-2 pt-2">
                    {step.content.map((point, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-4 border-t border-white/5">
                  <Link
                    href={step.action.href}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-400 hover:text-cyan-300 group-hover:translate-x-1 transition-transform"
                  >
                    <span>{step.action.label}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sales Scripts Copy Box */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 bg-slate-950/90 space-y-6">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-purple-400" />
          <div>
            <h2 className="text-lg font-bold text-white">Guiones de Venta Probados (Copiar & Pegar)</h2>
            <p className="text-xs text-slate-400">Úsalos para responder mensajes en redes sociales y cerrar ventas al instante.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {scripts.map((script) => (
            <div key={script.id} className="bg-slate-900/80 p-4 rounded-2xl border border-white/5 space-y-3 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-white block mb-2">{script.title}</span>
                <p className="text-xs text-slate-300 bg-slate-950/80 p-3 rounded-xl border border-white/5 leading-relaxed font-mono">
                  &ldquo;{script.text}&rdquo;
                </p>
              </div>

              <button
                type="button"
                onClick={() => copyScript(script.text, script.id)}
                className="btn-falcon-secondary text-xs py-2 px-3 self-start flex items-center gap-1.5"
              >
                {copiedScript === script.id ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400 font-bold">¡Guión Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar Guión</span>
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Migration Banner (Bring other creators) */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-slate-950 to-slate-950 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl">
        <div className="space-y-2">
          <span className="text-[10px] uppercase font-mono font-bold text-amber-400 bg-amber-950/80 px-2.5 py-1 rounded-md border border-amber-800/50">
            ¿Vendes en Hotmart o Gumroad?
          </span>
          <h3 className="text-xl font-bold text-white">Migra tus productos a FALKO y aumenta tus ganancias</h3>
          <p className="text-xs text-slate-300 max-w-xl">
            Menores comisiones (10% plano), cobros en Cripto USDT en 3 segundos sin bloqueos internacionales y pasarelas automáticas para PIX, SPEI, PSE y bancos locales.
          </p>
        </div>

        <Link
          href="/seller/products/new"
          className="btn-falcon-primary text-xs py-3 px-6 shadow-glow shrink-0 font-bold flex items-center gap-2"
        >
          <span>Publicar mi Producto Ahora</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
