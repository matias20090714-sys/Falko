import React from "react";
import Link from "next/link";
import { ShieldCheck, ArrowLeft, Lock, FileText } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 text-slate-300 text-xs sm:text-sm leading-relaxed">
      <Link href="/" className="text-xs text-slate-400 hover:text-cyan-400 flex items-center gap-1.5 mb-6">
        <ArrowLeft className="w-3.5 h-3.5" />
        Volver al Inicio
      </Link>

      <div className="border-b border-slate-800 pb-6">
        <span className="text-xs uppercase font-bold text-cyan-400 tracking-wider">Marco Jurídico</span>
        <h1 className="text-2xl sm:text-4xl font-heading font-black text-white mt-1">
          Términos y Condiciones de Servicio — FALKO
        </h1>
        <p className="text-xs text-slate-400 mt-2">Última actualización: Septiembre 2026</p>
      </div>

      <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-slate-800 space-y-6">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-white">1. Aceptación de los Términos</h2>
          <p>
            Al registrar una cuenta, adquirir productos digitales, publicar recursos o afiliarse a través de la plataforma FALKO ("FALKO", "nosotros"), usted acepta expresamente quedar vinculado por los presentes Términos de Servicio y por todas las políticas operativas incorporadas por referencia.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-white">2. Naturaleza del Marketplace y Multi-Rol</h2>
          <p>
            FALKO actúa como una plataforma tecnológica intermediaria internacional que facilita el intercambio de productos y licencias digitales entre Creadores (Vendedores), Promotores (Afiliados) y Clientes (Compradores). Un mismo usuario puede desempeñar uno o varios roles de manera concurrente.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-white">3. Política de Garantía y Retención Financiera</h2>
          <p>
            Todos los productos comercializados en FALKO cuentan con un período de garantía mínimo incondicional de siete (7) días naturales, extensible a catorce (14) o treinta (30) días a discreción del vendedor. Durante este período, los importes abonados permanecen retenidos en el libro contable de la plataforma para respaldar posibles solicitudes de reembolso legítimas.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-white">4. Tarifas de Plataforma y Comisiones</h2>
          <p>
            FALKO aplica una tarifa de procesamiento fija base de 25 UYU (o su equivalente oficial en la moneda de liquidación correspondiente) por cada transacción completada. Dicha comisión se descuenta en el momento del cálculo contable de la orden de forma automatizada e inmutable.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-white">5. Prevención de Fraude y Auto-Referidos</h2>
          <p>
            Queda estrictamente prohibida la práctica de auto-compras mediante enlaces propios de afiliado, la manipulación de tráfico mediante bots o cualquier artificio destinado a generar comisiones artificiales. FALKO se reserva el derecho de suspender cuentas y retener fondos generados fraudulentamente.
          </p>
        </section>
      </div>
    </div>
  );
}
