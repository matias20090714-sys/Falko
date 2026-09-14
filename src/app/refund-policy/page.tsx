import React from "react";
import Link from "next/link";
import { ShieldCheck, ArrowLeft, RefreshCw, CheckCircle2 } from "lucide-react";

export default function RefundPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 text-slate-300 text-xs sm:text-sm leading-relaxed">
      <Link href="/" className="text-xs text-slate-400 hover:text-cyan-400 flex items-center gap-1.5 mb-6">
        <ArrowLeft className="w-3.5 h-3.5" />
        Volver al Inicio
      </Link>

      <div className="border-b border-slate-800 pb-6">
        <span className="text-xs uppercase font-bold text-emerald-400 tracking-wider">Protección al Comprador</span>
        <h1 className="text-2xl sm:text-4xl font-heading font-black text-white mt-1">
          Política de Garantía y Reembolsos — FALKO
        </h1>
        <p className="text-xs text-slate-400 mt-2">Compromiso de satisfacción incondicional</p>
      </div>

      <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-slate-800 space-y-6">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            1. Período de Garantía Obligatorio
          </h2>
          <p>
            Ningún producto en FALKO puede contar con una garantía inferior a siete (7) días naturales contados a partir de la confirmación del pago. Los creadores pueden ampliar voluntariamente este plazo a catorce (14) o treinta (30) días.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-cyan-400" />
            2. Mecanismo de Reversión Contable Inmutable
          </h2>
          <p>
            Al procesarse un reembolso aprobado, el libro mayor contable ejecuta transacciones inversas inmediatas:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-slate-400">
            <li>Se restituye el 100% del monto al comprador.</li>
            <li>Se revierte la comisión del afiliado correspondiente.</li>
            <li>Se revierte la ganancia retenida del vendedor.</li>
            <li>Se actualizan los volúmenes del Ranking Global en USD.</li>
            <li>Se revoca de inmediato la validez de los tokens de descarga firmados.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-white">3. Cómo Solicitar un Reembolso</h2>
          <p>
            El comprador únicamente debe ingresar a su sección <strong>Mis Compras</strong> dentro de su biblioteca privada, localizar la orden y presionar el botón <em>Solicitar Reembolso</em> antes de la expiración de la fecha de garantía.
          </p>
        </section>
      </div>
    </div>
  );
}
