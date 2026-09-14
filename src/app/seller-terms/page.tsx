import React from "react";
import Link from "next/link";
import { ArrowLeft, ShoppingBag, ShieldCheck } from "lucide-react";

export default function SellerTermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 text-slate-300 text-xs sm:text-sm leading-relaxed">
      <Link href="/" className="text-xs text-slate-400 hover:text-cyan-400 flex items-center gap-1.5 mb-6">
        <ArrowLeft className="w-3.5 h-3.5" />
        Volver al Inicio
      </Link>

      <div className="border-b border-slate-800 pb-6">
        <span className="text-xs uppercase font-bold text-cyan-400 tracking-wider">Creadores & Vendedores</span>
        <h1 className="text-2xl sm:text-4xl font-heading font-black text-white mt-1">
          Términos y Condiciones para Creadores y Vendedores — FALKO
        </h1>
        <p className="text-xs text-slate-400 mt-2">Normativa de publicación, propiedad intelectual y liquidaciones</p>
      </div>

      <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-slate-800 space-y-6">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-white">1. Propiedad Intelectual y Licencias</h2>
          <p>
            El vendedor declara ser el autor legítimo o poseer los derechos suficientes para distribuir y comercializar los productos digitales publicados en FALKO. No se tolerará contenido con derechos de autor vulnerados.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-white">2. Garantía Mínima de 7 Días</h2>
          <p>
            El creador se compromete a respetar un período de garantía mínimo incondicional de 7 días naturales por cada venta realizada, asumiendo la reversión de las ganancias netas en caso de reembolso legítimo solicitado por el comprador.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-white">3. Tarifas y Retiros Locales</h2>
          <p>
            FALKO retiene la tarifa base de 25 UYU (o su equivalente oficial en la moneda de transacción) por cada pedido procesado. Los fondos disponibles pueden retirarse mediante los canales bancarios y digitales soportados en el país del vendedor.
          </p>
        </section>
      </div>
    </div>
  );
}
