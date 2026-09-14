import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/db";
import {
  ArrowRight,
  Bot,
  Briefcase,
  CheckCircle2,
  Code,
  DollarSign,
  Download,
  Flame,
  Globe2,
  Lock,
  Megaphone,
  Palette,
  Percent,
  PlusCircle,
  RefreshCw,
  Search,
  Share2,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  TrendingUp,
  Trophy,
  Users,
  Zap,
} from "lucide-react";
import { FalconLogo } from "@/components/layout/FalconLogo";
import { formatCurrency } from "@/lib/currency";
import { getLeaderboard, RANKING_TIERS } from "@/lib/ranking";

export const revalidate = 60; // ISR cache revalidation every minute

export default async function HomePage() {
  // Fetch featured products from DB
  const featuredProducts = await prisma.product.findMany({
    where: { status: "APPROVED" },
    take: 6,
    orderBy: { salesCount: "desc" },
    include: {
      seller: {
        select: { firstName: true, lastName: true, avatarUrl: true },
      },
      category: true,
    },
  });

  const categories = await prisma.category.findMany({
    take: 8,
    orderBy: { sortOrder: "asc" },
  });

  const topLeaders = await getLeaderboard("ALL_TIME", 3);

  return (
    <div className="relative overflow-hidden">
      {/* Dynamic Falcon Background Light Beam Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] bg-gradient-to-b from-cyan-500/15 via-blue-600/5 to-transparent blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-96 -left-48 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-[800px] -right-48 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* ======================================================== */}
      {/* 1. HERO SECTION                                          */}
      {/* ======================================================== */}
      <section className="relative pt-20 pb-24 md:pt-28 md:pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        {/* Floating Falcon Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 text-xs font-semibold mb-8 backdrop-blur-md shadow-glow animate-pulse-slow">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Marketplace Internacional de Alto Rendimiento</span>
          <span className="bg-cyan-500 text-slate-950 text-[10px] font-black px-1.5 py-0.2 rounded">
            28+ PAÍSES
          </span>
        </div>

        {/* Main Hero Headline */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-heading font-black tracking-tight text-white max-w-5xl mx-auto leading-[1.08]">
          El marketplace donde los{" "}
          <span className="gradient-text-falcon">productos digitales</span> se convierten en oportunidades.
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto font-normal leading-relaxed">
          Compra productos digitales con garantía protegida, vende tus conocimientos o gana comisiones escalables promocionando productos de creadores líderes en USD.
        </p>

        {/* Action Buttons: 3 Business Pillars */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-md sm:max-w-none mx-auto">
          <Link href="/marketplace" className="btn-falcon-primary w-full sm:w-auto text-sm py-3 px-6 shadow-glow-lg">
            <ShoppingBag className="w-4 h-4" />
            Explorar Productos
          </Link>
          <Link href="/seller" className="btn-falcon-secondary w-full sm:w-auto text-sm py-3 px-6 hover:border-cyan-400">
            <TrendingUp className="w-4 h-4 text-cyan-400" />
            Vender Productos
          </Link>
          <Link href="/affiliate" className="btn-falcon-secondary w-full sm:w-auto text-sm py-3 px-6 hover:border-purple-400">
            <Share2 className="w-4 h-4 text-purple-400" />
            Convertirme en Afiliado
          </Link>
        </div>

        {/* Trust Badges */}
        <div className="mt-14 pt-8 border-t border-slate-900 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-slate-400 text-xs">
          <div className="flex items-center justify-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Garantía 7 a 30 Días</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <Lock className="w-4 h-4 text-cyan-400" />
            <span>Descargas Privadas Firmadas</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <DollarSign className="w-4 h-4 text-amber-400" />
            <span>Comisión Fija (25 UYU Base)</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <Trophy className="w-4 h-4 text-purple-400" />
            <span>Ranking Global en USD</span>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 2. THE 3 MODELS (COMPRAR, VENDER, PROMOCIONAR)           */}
      {/* ======================================================== */}
      <section id="como-funciona" className="py-20 bg-slate-950/60 border-y border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs uppercase font-bold text-cyan-400 tracking-widest block mb-2">
              Ecosistema Integral
            </span>
            <h2 className="text-3xl sm:text-4xl font-heading font-black text-white">
              Diseñado para los tres pilares de la economía digital
            </h2>
            <p className="mt-3 text-slate-400 text-sm">
              En FALKO no necesitas cuentas separadas. Tu usuario puede comprar, vender y afiliarse en simultáneo.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Model 1: COMPRAR */}
            <div className="glass-panel rounded-2xl p-8 border border-slate-800/80 relative group hover:border-emerald-500/50 transition-all">
              <div className="w-14 h-14 rounded-2xl bg-emerald-950/60 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-6 group-hover:scale-110 transition-transform">
                <ShoppingBag className="w-7 h-7" />
              </div>
              <span className="text-[11px] uppercase tracking-wider font-bold text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-md">
                Para Compradores
              </span>
              <h3 className="text-xl font-heading font-bold text-white mt-4 mb-3">
                1. Compra con Certeza Total
              </h3>
              <p className="text-slate-400 text-xs leading-relaxed mb-6">
                Accede a plantillas, prompts de IA, boilerplates de código y masterclasses. Tus fondos quedan protegidos en retención de garantía durante 7, 14 o 30 días.
              </p>
              <ul className="space-y-2.5 text-xs text-slate-300 border-t border-slate-800/80 pt-4">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  Descargas con tokens privados firmados
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  Reembolso garantizado en 1 clic dentro del plazo
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  Reviews transparentes de compradores verificados
                </li>
              </ul>
            </div>

            {/* Model 2: VENDER */}
            <div className="glass-panel rounded-2xl p-8 border border-slate-800/80 relative group hover:border-cyan-500/50 transition-all">
              <div className="w-14 h-14 rounded-2xl bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-6 group-hover:scale-110 transition-transform">
                <TrendingUp className="w-7 h-7" />
              </div>
              <span className="text-[11px] uppercase tracking-wider font-bold text-cyan-400 bg-cyan-950/80 px-2.5 py-1 rounded-md">
                Para Vendedores
              </span>
              <h3 className="text-xl font-heading font-bold text-white mt-4 mb-3">
                2. Monetiza tus Conocimientos
              </h3>
              <p className="text-slate-400 text-xs leading-relaxed mb-6">
                Publica en minutos sin aprobaciones burocráticas previas. Configura tus precios, el porcentaje de afiliado (20% - 90%) y el modo de aprobación automático o manual.
              </p>
              <ul className="space-y-2.5 text-xs text-slate-300 border-t border-slate-800/80 pt-4">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                  Comisión fija baja de FALKO (25 UYU equivalente)
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                  Red de afiliados promocionando tu catálogo
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                  Retiros directos en tu moneda local (Pix, BROU, SPEI)
                </li>
              </ul>
            </div>

            {/* Model 3: PROMOCIONAR (AFILIADOS) */}
            <div className="glass-panel rounded-2xl p-8 border border-slate-800/80 relative group hover:border-purple-500/50 transition-all">
              <div className="w-14 h-14 rounded-2xl bg-purple-950/60 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-6 group-hover:scale-110 transition-transform">
                <Share2 className="w-7 h-7" />
              </div>
              <span className="text-[11px] uppercase tracking-wider font-bold text-purple-400 bg-purple-950/80 px-2.5 py-1 rounded-md">
                Para Afiliados
              </span>
              <h3 className="text-xl font-heading font-bold text-white mt-4 mb-3">
                3. Gana Comisiones de Alto Margen
              </h3>
              <p className="text-slate-400 text-xs leading-relaxed mb-6">
                Obtén tu identificador único (ej: <code>AFF-000001</code>), genera enlaces protegidos con cookies anti-fraude y escala en el Ranking Global en USD.
              </p>
              <ul className="space-y-2.5 text-xs text-slate-300 border-t border-slate-800/80 pt-4">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                  Hasta 50% de comisión por cada venta referida
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                  Tracking en tiempo real de clics y conversiones
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                  Insignias e hitos de $1k hasta $1,000,000 USD
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 3. FEATURED PRODUCTS SHOWCASE                            */}
      {/* ======================================================== */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
          <div>
            <span className="text-xs uppercase font-bold text-cyan-400 tracking-widest block mb-2">
              Catálogo Destacado
            </span>
            <h2 className="text-3xl font-heading font-black text-white">
              Productos digitales más demandados
            </h2>
          </div>
          <Link
            href="/marketplace"
            className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5 transition-all"
          >
            Ver todos los productos
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredProducts.map((p) => (
            <Link
              key={p.id}
              href={`/product/${p.slug}`}
              className="group glass-panel rounded-2xl overflow-hidden border border-slate-800/80 hover:border-cyan-500/40 transition-all flex flex-col"
            >
              {/* Cover Image Container */}
              <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-900">
                <img
                  src={p.coverImageUrl}
                  alt={p.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md text-[11px] font-semibold text-cyan-300 px-2.5 py-1 rounded-md border border-slate-800">
                  {p.category.name}
                </div>
                {p.affiliateEnabled && (
                  <div className="absolute top-3 right-3 bg-purple-950/90 backdrop-blur-md text-[11px] font-bold text-purple-300 px-2.5 py-1 rounded-md border border-purple-800/60 flex items-center gap-1">
                    <Percent className="w-3 h-3" />
                    {p.affiliateCommissionPct}% Afiliado
                  </div>
                )}
                <div className="absolute bottom-3 right-3 bg-slate-950/90 text-[10px] text-emerald-400 font-semibold px-2 py-0.5 rounded border border-emerald-900/60 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  Garantía {p.guaranteeDays}d
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-bold text-white group-hover:text-cyan-400 transition-colors line-clamp-2 mb-2">
                    {p.title}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-2 mb-4">
                    {p.shortDescription || p.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-slate-800 overflow-hidden">
                      {p.seller.avatarUrl ? (
                        <img src={p.seller.avatarUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-cyan-700 flex items-center justify-center text-[10px] font-bold">
                          {p.seller.firstName[0]}
                        </div>
                      )}
                    </div>
                    <span className="text-xs text-slate-400 truncate max-w-[100px]">
                      {p.seller.firstName} {p.seller.lastName}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-base font-black font-mono text-cyan-400">
                      {formatCurrency(p.price, p.currencyCode)}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ======================================================== */}
      {/* 4. FINANCIAL PRECISION & CALCULATOR TEASER               */}
      {/* ======================================================== */}
      <section className="py-20 bg-gradient-to-b from-slate-950 via-[#070d1e] to-slate-950 border-y border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-xs uppercase font-bold text-cyan-400 tracking-widest block mb-2">
                Transparencia Absoluta
              </span>
              <h2 className="text-3xl sm:text-4xl font-heading font-black text-white leading-tight">
                Reglas financieras inmutables calculadas en servidor
              </h2>
              <p className="mt-4 text-slate-300 text-sm leading-relaxed">
                A diferencia de otras plataformas con costos ocultos, FALKO utiliza una comisión fija transparente de <strong>25 UYU base</strong> (convertida a la moneda de la transacción) y garantiza el reparto exacto de cada venta en un ledger contable de doble entrada.
              </p>

              <div className="mt-8 space-y-4">
                <div className="glass-panel rounded-xl p-4 border border-slate-800 flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-lg bg-cyan-950 text-cyan-400 flex items-center justify-center shrink-0 mt-0.5">
                    1
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Retención durante la Garantía</h4>
                    <p className="text-xs text-slate-400">
                      Los ingresos permanecen en <code>pending_balance</code> durante los días de garantía estipulados y se liberan de forma automática a <code>available_balance</code>.
                    </p>
                  </div>
                </div>

                <div className="glass-panel rounded-xl p-4 border border-slate-800 flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-lg bg-purple-950 text-purple-400 flex items-center justify-center shrink-0 mt-0.5">
                    2
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Cero Sobre-facturación o Fuga Contable</h4>
                    <p className="text-xs text-slate-400">
                      El backend valida que <em>Comisión Afiliado + Tarifa FALKO + Ganancia Neta Vendedor = Monto Total</em> antes de registrar cualquier movimiento.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Visual Example Card */}
            <div className="glass-panel rounded-2xl p-6 md:p-8 border border-cyan-500/30 shadow-glow relative">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <FalconLogo size="sm" showText={false} />
                  <span className="font-bold text-white text-sm">Desglose Real de Venta</span>
                </div>
                <span className="text-xs font-mono bg-cyan-950 text-cyan-300 px-2 py-0.5 rounded border border-cyan-800">
                  Ejemplo Certificado
                </span>
              </div>

              <div className="my-6 space-y-3">
                <div className="flex justify-between items-center bg-slate-950/70 p-3 rounded-lg border border-slate-800">
                  <span className="text-xs text-slate-300">Precio Producto Digital:</span>
                  <span className="font-mono font-bold text-white text-sm">500.00 UYU</span>
                </div>

                <div className="flex justify-between items-center bg-purple-950/30 p-3 rounded-lg border border-purple-900/40">
                  <span className="text-xs text-purple-300">Comisión Afiliado (20%):</span>
                  <span className="font-mono font-bold text-purple-400 text-sm">+100.00 UYU</span>
                </div>

                <div className="flex justify-between items-center bg-cyan-950/30 p-3 rounded-lg border border-cyan-900/40">
                  <span className="text-xs text-cyan-300">Tarifa Fija Plataforma FALKO:</span>
                  <span className="font-mono font-bold text-cyan-400 text-sm">+25.00 UYU</span>
                </div>

                <div className="flex justify-between items-center bg-emerald-950/40 p-3.5 rounded-lg border border-emerald-800/60 shadow-sm">
                  <span className="text-xs font-bold text-emerald-300">Ganancia Neta para el Creador:</span>
                  <span className="font-mono font-black text-emerald-400 text-base">375.00 UYU</span>
                </div>
              </div>

              <div className="text-[11px] text-slate-400 text-center">
                Disponible en USD y en más de 28 monedas locales con conversión automática.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 5. GLOBAL RANKING IN USD TEASER                          */}
      {/* ======================================================== */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs uppercase font-bold text-cyan-400 tracking-widest block mb-2">
            Competitividad Global
          </span>
          <h2 className="text-3xl sm:text-4xl font-heading font-black text-white">
            Ranking Global de Ventas en USD
          </h2>
          <p className="mt-3 text-slate-400 text-sm">
            Reconocimiento internacional que mide el volumen de ventas generado. Cada usuario tiene su propia barra de progreso de hitos de $0 a $1M USD.
          </p>
        </div>

        {/* Podium Leaders Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {topLeaders.map((leader, i) => (
            <div
              key={leader.userId}
              className={`glass-panel rounded-2xl p-6 border transition-all text-center relative ${
                i === 0
                  ? "border-amber-500/50 bg-amber-950/15 shadow-glow-gold scale-105 order-1 md:order-2"
                  : i === 1
                  ? "border-slate-400/30 order-2 md:order-1"
                  : "border-amber-700/30 order-3"
              }`}
            >
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-xs font-mono font-bold bg-slate-900 border border-slate-700">
                {i === 0 ? "🥇 TOP 1" : i === 1 ? "🥈 TOP 2" : "🥉 TOP 3"}
              </div>

              <div className="w-16 h-16 rounded-2xl mx-auto mt-3 mb-4 bg-slate-800 overflow-hidden border-2 border-slate-700 shadow-md">
                {leader.avatarUrl ? (
                  <img src={leader.avatarUrl} alt={leader.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-bold text-white">
                    {leader.name[0]}
                  </div>
                )}
              </div>

              <h4 className="font-bold text-white text-base">{leader.name}</h4>
              <span className="text-xs text-slate-400 block mb-3">
                {leader.tier.badge} {leader.tier.name}
              </span>

              <div className="bg-slate-950/80 rounded-xl p-3 border border-slate-800">
                <span className="text-[10px] uppercase text-slate-400 block mb-0.5">Volumen Generado</span>
                <span className="text-xl font-mono font-black text-cyan-400">
                  ${leader.salesVolumeUsd.toLocaleString("en-US", { minimumFractionDigits: 2 })} USD
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Link href="/ranking" className="btn-falcon-secondary text-xs py-2.5 px-6">
            <Trophy className="w-4 h-4 text-cyan-400" />
            Explorar Ranking Completo & Hitos
          </Link>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 6. FAQ SECTION                                           */}
      {/* ======================================================== */}
      <section className="py-20 bg-slate-950/60 border-t border-slate-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-heading font-black text-white">Preguntas Frecuentes</h2>
            <p className="mt-2 text-slate-400 text-xs">Todo lo que necesitas saber para operar en FALKO</p>
          </div>

          <div className="space-y-4">
            <div className="glass-panel rounded-xl p-5 border border-slate-800">
              <h4 className="font-bold text-sm text-white mb-2">¿Cómo funciona el período de garantía y retención de fondos?</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Cada vendedor define una garantía de mínimo 7 días (opciones de 7, 14 o 30 días). Durante este tiempo, los ingresos se registran en tu saldo pendiente (<code>pending_balance</code>). Una vez transcurrido el plazo sin solicitud de reembolso, los fondos pasan a estar disponibles inmediatamente para retiro.
              </p>
            </div>

            <div className="glass-panel rounded-xl p-5 border border-slate-800">
              <h4 className="font-bold text-sm text-white mb-2">¿Cómo se calcula la comisión fija de FALKO en diferentes países?</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                La tarifa base de la plataforma es de 25 UYU. Cuando una compra se efectúa en USD, MXN, BRL, CLP u otra moneda de los 28+ países soportados, el backend convierte esa base a la divisa correspondiente utilizando el tipo de cambio oficial del día, garantizando equidad internacional.
              </p>
            </div>

            <div className="glass-panel rounded-xl p-5 border border-slate-800">
              <h4 className="font-bold text-sm text-white mb-2">¿Qué diferencia hay entre aprobación de afiliados AUTO y MANUAL?</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                En modo <strong>AUTO</strong>, cualquier usuario puede obtener su enlace de afiliado inmediatamente para comenzar a promocionar. En modo <strong>MANUAL</strong>, el afiliado debe enviar una solicitud al vendedor desde la página del producto y esperar a que el creador la apruebe desde su panel. La aprobación es individual por cada producto.
              </p>
            </div>

            <div className="glass-panel rounded-xl p-5 border border-slate-800">
              <h4 className="font-bold text-sm text-white mb-2">¿Cómo se descargan los archivos digitales comprados?</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Los archivos digitales nunca están expuestos en URLs públicas. Al acceder a tu sección <em>Mis Compras</em>, el sistema genera tokens temporales firmados criptográficamente con validez de 15 minutos, verificando en tiempo real que tu compra esté confirmada y no reembolsada.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 7. FINAL CTA                                             */}
      {/* ======================================================== */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center relative">
        <div className="glass-panel rounded-3xl p-10 md:p-16 border border-cyan-500/40 relative overflow-hidden shadow-glow-lg">
          <div className="absolute -top-32 -right-32 w-80 h-80 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-3xl mx-auto">
            <FalconLogo size="lg" className="justify-center mb-6" />
            <h2 className="text-3xl sm:text-5xl font-heading font-black text-white leading-tight">
              Únete a la nueva era del comercio digital internacional
            </h2>
            <p className="mt-4 text-slate-300 text-sm sm:text-base leading-relaxed">
              Crea tu cuenta gratuita en menos de 1 minuto y accede a todas las herramientas de compra, venta y afiliación de FALKO.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3.5">
              <Link href="/register" className="btn-falcon-primary text-sm py-3 px-8 shadow-glow">
                Comenzar Gratis en FALKO
              </Link>
              <Link href="/marketplace" className="btn-falcon-secondary text-sm py-3 px-8">
                Explorar Marketplace
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
