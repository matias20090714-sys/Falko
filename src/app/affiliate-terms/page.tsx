import React from "react";
import Link from "next/link";
import { ArrowLeft, Percent, Share2 } from "lucide-react";

export default function AffiliateTermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 text-slate-300 text-xs sm:text-sm leading-relaxed">
      <Link href="/" className="text-xs text-slate-400 hover:text-cyan-400 flex items-center gap-1.5 mb-6">
        <ArrowLeft className="w-3.5 h-3.5" />
        Volver al Inicio
      </Link>

      <div className="border-b border-slate-800 pb-6">
        <span className="text-xs uppercase font-bold text-purple-400 tracking-wider">Programa de Afiliados</span>
        <h1 className="text-2xl sm:text-4xl font-heading font-black text-white mt-1">
          Términos y Condiciones para Afiliados — FALKO
        </h1>
        <p className="text-xs text-slate-400 mt-2">Normativa de promoción ética, comisiones y ranking</p>
      </div>

      <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-slate-800 space-y-6">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-white">1. Generación de Enlaces y Atribución</h2>
          <p>
            Cada afiliado dispone de un código identificador único (ej: <code>AFF-000001</code>). Las cookies de atribución registran las visitas y conversiones de forma transparente.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-white">2. Liquidación y Período de Garantía</h2>
          <p>
            Las comisiones generadas ingresan a la billetera interna del afiliado en estado retenido (<code>pending_balance</code>) hasta la finalización del período de garantía del producto vendido. Una vez transcurrido dicho plazo sin reembolso, el dinero pasa a estar disponible para su retiro.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-white">3. Políticas Anti-Spam y Publicidad Engañosa</h2>
          <p>
            Está prohibido el spam masivo por correo electrónico no solicitado, el uso de claims falsos o la suplantación de la identidad de los creadores originales.
          </p>
        </section>
      </div>
    </div>
  );
}
