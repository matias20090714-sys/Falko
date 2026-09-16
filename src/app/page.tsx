import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import {
  ArrowRight,
  CheckCircle2,
  Globe2,
  Lock,
  LogIn,
  Percent,
  Play,
  Share2,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  TrendingUp,
  User,
  Zap,
} from "lucide-react";
import { FalconLogo } from "@/components/layout/FalconLogo";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  // If user is already logged in, redirect directly to their Dashboard/Sales panel
  const currentUser = await getCurrentUser();
  if (currentUser) {
    redirect("/dashboard");
  }

  return (
    <div className="relative overflow-hidden">
      {/* Dynamic Ambient Aurora Lights */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[550px] bg-gradient-to-b from-cyan-500/20 via-purple-600/10 to-transparent blur-[120px] pointer-events-none -z-10" />
      <div className="absolute top-80 right-10 w-96 h-96 bg-cyan-500/10 blur-[100px] pointer-events-none -z-10" />
      <div className="absolute top-96 left-10 w-96 h-96 bg-purple-500/10 blur-[100px] pointer-events-none -z-10" />

      {/* ======================================================== */}
      {/* 1. HERO: REGISTRARSE & INICIAR SESIÓN                     */}
      {/* ======================================================== */}
      <section className="relative pt-16 pb-24 md:pt-24 md:pb-32 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto text-center">
        {/* Falcon Top Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/80 border border-cyan-500/40 text-cyan-300 text-xs font-semibold mb-8 backdrop-blur-xl shadow-glow">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span>Infraestructura Global de Productos Digitales</span>
          <span className="bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full">
            28+ PAÍSES
          </span>
        </div>

        {/* Main Hero Title */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-heading font-black tracking-tight text-white leading-[1.08] max-w-5xl mx-auto">
          Monetiza, escala y distribuye <br className="hidden sm:inline" />
          <span className="gradient-text-falcon">recursos digitales</span> sin fronteras.
        </h1>

        {/* Description */}
        <p className="mt-6 text-base sm:text-lg lg:text-xl text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
          <strong>FALKO</strong> conecta a creadores de alto impacto con una red global de afiliados y compradores con pagos inmediatos, bóveda digital y garantía protegida.
        </p>

        {/* Action Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md sm:max-w-none mx-auto">
          <Link
            href="/register"
            className="btn-falcon-primary w-full sm:w-auto text-sm py-3.5 px-8 shadow-glow flex items-center justify-center gap-2 group"
          >
            <User className="w-4 h-4" />
            <span>Crear Cuenta Gratis</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
          <Link
            href="/login"
            className="btn-falcon-secondary w-full sm:w-auto text-sm py-3.5 px-8 flex items-center justify-center gap-2"
          >
            <LogIn className="w-4 h-4 text-cyan-400" />
            <span>Iniciar Sesión</span>
          </Link>
        </div>

        {/* Floating Live Mock Stats Pill Grid */}
        <div className="mt-14 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto text-left">
          <div className="glass-panel p-3.5 rounded-2xl border border-white/5">
            <span className="text-[10px] uppercase font-bold text-slate-400 block font-mono">Tarifa Base</span>
            <span className="text-sm font-black font-mono text-cyan-400">25 UYU Fijo</span>
          </div>

          <div className="glass-panel p-3.5 rounded-2xl border border-white/5">
            <span className="text-[10px] uppercase font-bold text-slate-400 block font-mono">Garantía</span>
            <span className="text-sm font-black font-mono text-emerald-400">7 a 30 Días</span>
          </div>

          <div className="glass-panel p-3.5 rounded-2xl border border-white/5">
            <span className="text-[10px] uppercase font-bold text-slate-400 block font-mono">Afiliados</span>
            <span className="text-sm font-black font-mono text-purple-400">Hasta 80% Comis.</span>
          </div>

          <div className="glass-panel p-3.5 rounded-2xl border border-white/5">
            <span className="text-[10px] uppercase font-bold text-slate-400 block font-mono">Bóveda Digital</span>
            <span className="text-sm font-black font-mono text-white">Cifrado AES-256</span>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 2. CÓMO FUNCIONA: LOS 3 PILARES ESENCIALES                */}
      {/* ======================================================== */}
      <section id="como-funciona" className="py-20 bg-slate-950/70 border-t border-slate-900/80 relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold font-mono text-cyan-400 uppercase tracking-widest mb-2">
              <Zap className="w-3.5 h-3.5" /> Arquitectura Unificada
            </div>
            <h2 className="text-3xl sm:text-4xl font-heading font-black text-white">
              ¿Cómo opera el ecosistema FALKO?
            </h2>
            <p className="mt-3 text-slate-400 text-xs sm:text-sm">
              Una única cuenta inteligente para comprar recursos exclusivos, vender tus productos y cobrar comisiones internacionales.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Comprador */}
            <div className="glass-panel-hover glass-panel p-8 space-y-4 border border-slate-800/80 rounded-2xl relative group">
              <div className="w-12 h-12 rounded-xl bg-emerald-950/60 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-sm group-hover:scale-110 transition-transform">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-heading font-bold text-white">
                1. Compra Segura
              </h3>
              <p className="text-slate-300 text-xs leading-relaxed">
                Accede a plantillas, cursos en video, prompts, software y archivos descargables con garantía de satisfacción y descargas privadas temporales.
              </p>
              <div className="pt-2 flex items-center gap-1.5 text-emerald-400 text-[11px] font-semibold">
                <ShieldCheck className="w-4 h-4" /> Respaldo financiero automático
              </div>
            </div>

            {/* Vendedor */}
            <div className="glass-panel-hover glass-panel p-8 space-y-4 border border-cyan-500/30 rounded-2xl relative group shadow-glow">
              <div className="w-12 h-12 rounded-xl bg-cyan-950/80 border border-cyan-400/50 flex items-center justify-center text-cyan-300 shadow-sm group-hover:scale-110 transition-transform">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-heading font-bold text-white">
                2. Vende sin Fricción
              </h3>
              <p className="text-slate-300 text-xs leading-relaxed">
                Publica tus productos en minutos, sube archivos o videos, define enlaces privados de Notion o Drive y cobra en tu moneda local con retiros directos.
              </p>
              <div className="pt-2 flex items-center gap-1.5 text-cyan-400 text-[11px] font-semibold">
                <Sparkles className="w-4 h-4" /> Tarifa plana de 25 UYU
              </div>
            </div>

            {/* Afiliado */}
            <div className="glass-panel-hover glass-panel p-8 space-y-4 border border-purple-500/30 rounded-2xl relative group">
              <div className="w-12 h-12 rounded-xl bg-purple-950/60 border border-purple-400/40 flex items-center justify-center text-purple-300 shadow-sm group-hover:scale-110 transition-transform">
                <Share2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-heading font-bold text-white">
                3. Gana como Afiliado
              </h3>
              <p className="text-slate-300 text-xs leading-relaxed">
                Genera tu enlace único de rastreo para productos con alta conversión y recibe comisiones automáticas acreditadas al instante en tu billetera.
              </p>
              <div className="pt-2 flex items-center gap-1.5 text-purple-400 text-[11px] font-semibold">
                <Percent className="w-4 h-4" /> Comisiones de hasta el 80%
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 3. PÁSATE A FALKO: COMPARATIVA & MIGRACIÓN EXCLUSIVA     */}
      {/* ======================================================== */}
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
              Conserva más dinero de cada venta. En FALKO pagas únicamente <strong>10% plano</strong> sin tarifas de mantenimiento mensual, con acreditación instantánea y retiros directos a tu banco local o en Cripto USDT.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-left">
              <div className="bg-slate-900/80 p-3 rounded-xl border border-white/5">
                <span className="text-[10px] text-slate-400 font-mono block">Tarifa FALKO</span>
                <span className="text-xs font-bold text-emerald-400">10% Neto</span>
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

      {/* ======================================================== */}
      {/* 4. LLAMADO A LA ACCIÓN FINAL                             */}
      {/* ======================================================== */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center">
        <div className="glass-panel-glow p-8 sm:p-14 border border-cyan-500/40 shadow-glow rounded-3xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
          <FalconLogo size="lg" className="justify-center mb-6" />
          <h3 className="text-2xl sm:text-4xl font-heading font-black text-white tracking-tight">
            Comienza a operar en FALKO
          </h3>
          <p className="mt-3 text-slate-300 text-xs sm:text-sm max-w-lg mx-auto leading-relaxed">
            Crea tu cuenta gratuita en segundos o inicia sesión para ingresar a tu panel de control, ventas y transacciones.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3.5">
            <Link
              href="/register"
              className="btn-falcon-primary text-xs py-3 px-7 shadow-glow flex items-center justify-center gap-2"
            >
              <User className="w-4 h-4" />
              <span>Registrarse Ahora</span>
            </Link>
            <Link
              href="/login"
              className="btn-falcon-secondary text-xs py-3 px-7 flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4 text-cyan-400" />
              <span>Iniciar Sesión</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
