import React from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatCurrency } from "@/lib/currency";
import { Percent, Share2, ShieldCheck, Sparkles, Star, TrendingUp, Zap } from "lucide-react";

export const revalidate = 0;

export default async function AffiliateProductsCatalogPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login?redirect=/affiliate/products");
  }

  // Fetch all approved products with affiliate enabled
  const products = await prisma.product.findMany({
    where: {
      status: "APPROVED",
      affiliateEnabled: true,
    },
    include: {
      category: true,
      seller: { select: { firstName: true, lastName: true } },
    },
    orderBy: { salesCount: "desc" },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs uppercase font-bold text-purple-400">
            Catálogo de Afiliación
          </span>
          <span className="text-[10px] bg-purple-950 text-purple-300 border border-purple-800 px-2 py-0.5 rounded-full font-mono">
            ALTO RENDIMIENTO
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-heading font-black text-white">
          Productos Disponibles para Promocionar
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Genera ingresos promoviendo herramientas, plantillas y cursos de creadores verificados.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((p) => {
          const estimatedEarning = (p.price * p.affiliateCommissionPct) / 100;

          return (
            <div
              key={p.id}
              className="glass-panel rounded-2xl overflow-hidden border border-slate-800 flex flex-col justify-between hover:border-purple-500/50 transition-all shadow-md group"
            >
              <div>
                {/* Cover */}
                <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-900">
                  <img src={p.coverImageUrl} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md text-[10px] font-bold text-cyan-300 px-2.5 py-0.5 rounded border border-slate-800">
                    {p.category.name}
                  </div>
                  <div className="absolute top-3 right-3 bg-purple-950/90 backdrop-blur-md text-xs font-bold text-purple-300 px-2.5 py-1 rounded-lg border border-purple-800/80 flex items-center gap-1 shadow-md">
                    <Percent className="w-3.5 h-3.5" />
                    {p.affiliateCommissionPct}% Comisión
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 space-y-2">
                  <h3 className="text-base font-bold text-white line-clamp-2">{p.title}</h3>
                  <p className="text-xs text-slate-400 line-clamp-2">{p.shortDescription || p.description}</p>
                </div>
              </div>

              {/* Footer metrics & CTA */}
              <div className="p-5 pt-0">
                <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3 mb-4 space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Precio Producto:</span>
                    <span className="font-mono text-white font-bold">{formatCurrency(p.price, p.currencyCode)}</span>
                  </div>
                  <div className="flex justify-between text-purple-400">
                    <span className="font-semibold">Tu Ganancia por Venta:</span>
                    <span className="font-mono font-black text-sm">+{formatCurrency(estimatedEarning, p.currencyCode)}</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-800">
                    <span>Modo de Aprobación:</span>
                    <span className="font-bold text-slate-300">{p.affiliateApprovalMode === "AUTO" ? "Automática (Inmediato)" : "Revisión Manual"}</span>
                  </div>
                </div>

                <Link
                  href={`/product/${p.slug}`}
                  className="btn-falcon-primary w-full text-center justify-center text-xs py-2.5 shadow-glow"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  Obtener Enlace de Afiliado
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
