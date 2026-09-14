import React from "react";
import Link from "next/link";
import { ArrowLeft, Lock, ShieldCheck } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 text-slate-300 text-xs sm:text-sm leading-relaxed">
      <Link href="/" className="text-xs text-slate-400 hover:text-cyan-400 flex items-center gap-1.5 mb-6">
        <ArrowLeft className="w-3.5 h-3.5" />
        Volver al Inicio
      </Link>

      <div className="border-b border-slate-800 pb-6">
        <span className="text-xs uppercase font-bold text-cyan-400 tracking-wider">Seguridad & Privacidad</span>
        <h1 className="text-2xl sm:text-4xl font-heading font-black text-white mt-1">
          Política de Privacidad y Protección de Datos — FALKO
        </h1>
        <p className="text-xs text-slate-400 mt-2">Protegemos tu información financiera y personal con cifrado de grado bancario.</p>
      </div>

      <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-slate-800 space-y-6">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-white">1. Datos Recolectados</h2>
          <p>
            Recopilamos únicamente los datos necesarios para procesar transacciones, emitir facturas, liquidar comisiones y prevenir fraudes (Nombre, Email, País de residencia y datos bancarios de retiro suministrados voluntariamente).
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-white">2. Almacenamiento Privado y Encriptación</h2>
          <p>
            Los archivos digitales nunca son expuestos de forma pública. Las contraseñas están resguardadas mediante algoritmos de hashing bcrypt de alto costo computacional y las sesiones se protegen mediante cookies HTTP-Only seguras.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-white">3. Confidencialidad Financiera</h2>
          <p>
            FALKO nunca vende ni comparte información con anunciantes de terceros. Los datos de pago viajan directamente a los procesadores homologados.
          </p>
        </section>
      </div>
    </div>
  );
}
