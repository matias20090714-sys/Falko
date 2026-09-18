"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FalconLogo } from "./FalconLogo";
import { ShieldCheck, Lock, Globe, Zap, Heart } from "lucide-react";
import { COUNTRIES } from "@/lib/currency";

export function Footer() {
  const pathname = usePathname();
  const popularCountries = ["UY", "US", "BR", "MX", "AR", "CL", "CO", "PE", "ES"];

  // Hide platform-wide footer on product sales page to provide an independent standalone store
  if (pathname?.startsWith("/product/")) {
    return null;
  }

  return (
    <footer className="bg-[#050814] border-t border-slate-900 text-slate-400 text-xs mt-20">
      {/* Top Banner: Security & Transparency */}
      <div className="border-b border-slate-900/80 bg-slate-950/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-950/50 border border-cyan-800/40 flex items-center justify-center text-cyan-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h5 className="font-bold text-slate-200 text-sm">Garantía Protegida 7-30 Días</h5>
                <p className="text-[11px] text-slate-400">Tus compras están aseguradas con retención de fondos.</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-950/50 border border-blue-800/40 flex items-center justify-center text-blue-400">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h5 className="font-bold text-slate-200 text-sm">Descargas Privadas Firmadas</h5>
                <p className="text-[11px] text-slate-400">Tokens temporales de alta seguridad sin URLs públicas.</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-950/50 border border-amber-800/40 flex items-center justify-center text-amber-400">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h5 className="font-bold text-slate-200 text-sm">Comisiones Inmutables & Multi-Divisa</h5>
                <p className="text-[11px] text-slate-400">Ledger contable de doble entrada en 28+ países.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Col 1: Brand Info */}
          <div className="col-span-2 space-y-4">
            <FalconLogo size="md" />
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              FALKO es la plataforma tecnológica internacional que conecta creadores de productos digitales de alta calidad, compradores exigentes y afiliados de rendimiento global.
            </p>
            <div className="flex flex-wrap gap-1.5 pt-2">
              {popularCountries.map((c) => (
                <span
                  key={c}
                  title={COUNTRIES[c]?.name}
                  className="bg-slate-900 border border-slate-800 px-2 py-1 rounded text-xs flex items-center gap-1 cursor-default"
                >
                  <span>{COUNTRIES[c]?.flag}</span>
                  <span className="font-mono text-[10px] text-slate-300">{c}</span>
                </span>
              ))}
              <span className="bg-slate-900 border border-slate-800 px-2 py-1 rounded text-[10px] text-cyan-400 font-semibold">
                +19 países
              </span>
            </div>
          </div>

          {/* Col 2: Marketplace */}
          <div>
            <h4 className="font-bold text-white text-sm uppercase tracking-wider mb-3">Marketplace</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/marketplace" className="hover:text-cyan-400 transition-colors">
                  Explorar Productos
                </Link>
              </li>
              <li>
                <Link href="/marketplace?category=inteligencia-artificial" className="hover:text-cyan-400 transition-colors">
                  Inteligencia Artificial
                </Link>
              </li>
              <li>
                <Link href="/marketplace?category=programacion" className="hover:text-cyan-400 transition-colors">
                  Boilerplates & Dev Tools
                </Link>
              </li>
              <li>
                <Link href="/marketplace?category=marketing" className="hover:text-cyan-400 transition-colors">
                  Embudos & Marketing
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Creadores y Afiliados */}
          <div>
            <h4 className="font-bold text-white text-sm uppercase tracking-wider mb-3">Oportunidades</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/seller" className="hover:text-cyan-400 transition-colors">
                  Vender en FALKO
                </Link>
              </li>
              <li>
                <Link href="/seller/products/new" className="hover:text-cyan-400 transition-colors">
                  Publicar Producto
                </Link>
              </li>
              <li>
                <Link href="/affiliate" className="hover:text-cyan-400 transition-colors">
                  Programa de Afiliados
                </Link>
              </li>
              <li>
                <Link href="/wallet" className="hover:text-cyan-400 transition-colors">
                  Billetera & Retiros
                </Link>
              </li>
              <li>
                <Link href="/withdrawals" className="hover:text-cyan-400 transition-colors">
                  Métodos de Pago Locales
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Legal & Políticas */}
          <div>
            <h4 className="font-bold text-white text-sm uppercase tracking-wider mb-3">Legal</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/terms" className="hover:text-cyan-400 transition-colors">
                  Términos de Servicio
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-cyan-400 transition-colors">
                  Política de Privacidad
                </Link>
              </li>
              <li>
                <Link href="/refund-policy" className="hover:text-cyan-400 transition-colors">
                  Política de Reembolsos
                </Link>
              </li>
              <li>
                <Link href="/affiliate-terms" className="hover:text-cyan-400 transition-colors">
                  Términos de Afiliados
                </Link>
              </li>
              <li>
                <Link href="/seller-terms" className="hover:text-cyan-400 transition-colors">
                  Términos para Vendedores
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
          <p>© {new Date().getFullYear()} FALKO Technologies Inc. Todos los derechos reservados.</p>
          <p className="flex items-center gap-1">
            Diseñado para la nueva generación de creadores digitales 🦅
          </p>
        </div>
      </div>
    </footer>
  );
}
