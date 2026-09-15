import React from "react";
import Link from "next/link";
import {
  LogIn,
  Share2,
  ShoppingBag,
  Sparkles,
  TrendingUp,
  User,
} from "lucide-react";
import { FalconLogo } from "@/components/layout/FalconLogo";

export const dynamic = "force-dynamic";

export default function HomePage() {
  return (
    <div className="relative overflow-hidden">
      {/* Dynamic Ambient Lights */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-[450px] bg-gradient-to-b from-cyan-500/15 via-blue-600/5 to-transparent blur-3xl pointer-events-none -z-10" />

      {/* 1. HERO: REGISTRARSE & INICIAR SESIÓN */}
      <section className="relative pt-16 pb-20 md:pt-24 md:pb-28 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-xs font-semibold mb-6 backdrop-blur-md">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Marketplace Internacional de Productos Digitales</span>
          <span className="bg-cyan-500 text-slate-950 text-[10px] font-black px-1.5 py-0.2 rounded">
            28+ PAÍSES
          </span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-heading font-black tracking-tight text-white leading-[1.1]">
          Compra, vende y promociona <br className="hidden sm:inline" />
          <span className="gradient-text-falcon">productos digitales</span> en todo el mundo.
        </h1>

        <p className="mt-5 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
          <strong>FALKO</strong> es la plataforma donde creadores publican recursos digitales, los afiliados generan ingresos escalables y los compradores adquieren con garantía protegida y descargas privadas.
        </p>

        {/* Botones de Registro e Inicio de Sesión */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md sm:max-w-none mx-auto">
          <Link href="/register" className="btn-falcon-primary w-full sm:w-auto text-sm py-3 px-8 shadow-glow flex items-center justify-center gap-2">
            <User className="w-4 h-4" />
            Registrarse
          </Link>
          <Link href="/login" className="btn-falcon-secondary w-full sm:w-auto text-sm py-3 px-8 hover:border-cyan-400 flex items-center justify-center gap-2">
            <LogIn className="w-4 h-4 text-cyan-400" />
            Iniciar Sesión
          </Link>
        </div>
      </section>

      {/* 2. CÓMO FUNCIONA */}
      <section id="como-funciona" className="py-16 bg-slate-950/60 border-t border-slate-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-heading font-black text-white">
              ¿Cómo funciona FALKO?
            </h2>
            <p className="mt-2 text-slate-400 text-xs sm:text-sm">
              Una única cuenta para comprar, vender y promocionar sin complicaciones.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-panel rounded-2xl p-6 border border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-emerald-950/60 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-heading font-bold text-white mb-2">
                1. Compra Segura
              </h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Accede a software, plantillas, cursos y prompts con garantía de satisfacción.
              </p>
            </div>

            <div className="glass-panel rounded-2xl p-6 border border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-4">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-heading font-bold text-white mb-2">
                2. Vende sin Fricción
              </h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Publica tu producto digital en minutos y recibe retiros directos en tu moneda local.
              </p>
            </div>

            <div className="glass-panel rounded-2xl p-6 border border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-purple-950/60 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-4">
                <Share2 className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-heading font-bold text-white mb-2">
                3. Gana como Afiliado
              </h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Genera tu enlace único de rastreo y obtén comisiones automáticas por venta.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. LLAMADO A LA ACCIÓN FINAL */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center">
        <div className="glass-panel rounded-2xl p-8 sm:p-12 border border-cyan-500/30 shadow-glow">
          <FalconLogo size="md" className="justify-center mb-4" />
          <h3 className="text-2xl sm:text-3xl font-heading font-black text-white">
            Comienza a operar en FALKO
          </h3>
          <p className="mt-2 text-slate-300 text-xs sm:text-sm max-w-lg mx-auto">
            Crea tu cuenta gratuita en segundos y accede a todas las funciones.
          </p>

          <div className="mt-6 flex flex-col sm:flex-row justify-center gap-3">
            <Link href="/register" className="btn-falcon-primary text-xs py-2.5 px-6 shadow-glow flex items-center justify-center gap-2">
              <User className="w-3.5 h-3.5" />
              Registrarse
            </Link>
            <Link href="/login" className="btn-falcon-secondary text-xs py-2.5 px-6 flex items-center justify-center gap-2">
              <LogIn className="w-3.5 h-3.5 text-cyan-400" />
              Iniciar Sesión
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
