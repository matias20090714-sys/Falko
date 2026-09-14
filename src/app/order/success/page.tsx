import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { CheckCircle2, Download, Package, ShieldCheck, ArrowRight } from "lucide-react";
import { formatCurrency } from "@/lib/currency";

export default async function OrderSuccessPage({
  searchParams,
}: {
  searchParams: { orderNumber?: string };
}) {
  const orderNumber = searchParams.orderNumber;

  let order = null;
  if (orderNumber) {
    order = await prisma.order.findUnique({
      where: { orderNumber },
      include: {
        items: {
          include: { product: true },
        },
      },
    });
  }

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-lg w-full glass-panel rounded-3xl p-8 border border-emerald-500/40 text-center shadow-glow relative">
        <div className="w-16 h-16 rounded-full bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mx-auto mb-6">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <span className="text-xs uppercase font-bold text-emerald-400 tracking-wider block mb-1">
          ¡Pago Confirmado Exitosamente!
        </span>
        <h1 className="text-2xl font-heading font-black text-white mb-2">
          Gracias por tu compra en FALKO
        </h1>

        {order ? (
          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-5 my-6 text-left space-y-3">
            <div className="flex justify-between text-xs pb-3 border-b border-slate-800">
              <span className="text-slate-400">Número de Orden:</span>
              <span className="font-mono font-bold text-white">{order.orderNumber}</span>
            </div>

            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Producto:</span>
              <span className="font-bold text-white truncate max-w-[200px]">
                {order.items[0]?.product?.title}
              </span>
            </div>

            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Total Pagado:</span>
              <span className="font-mono font-bold text-cyan-400">
                {formatCurrency(order.totalAmount, order.currencyCode)}
              </span>
            </div>

            <div className="flex justify-between text-xs pt-2 border-t border-slate-800 text-emerald-400">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                Garantía Activa:
              </span>
              <span>{order.guaranteeDays} días (hasta {new Date(order.guaranteeReleaseDate).toLocaleDateString()})</span>
            </div>
          </div>
        ) : (
          <p className="text-xs text-slate-400 my-6">
            Tu orden ha sido procesada con éxito y tus archivos digitales ya se encuentran disponibles en tu biblioteca privada.
          </p>
        )}

        <div className="space-y-3">
          <Link
            href="/library"
            className="btn-falcon-primary w-full text-center justify-center text-sm py-3 shadow-glow"
          >
            <Download className="w-4 h-4" />
            Ir a Mi Biblioteca & Descargar
          </Link>

          <Link
            href="/marketplace"
            className="btn-falcon-secondary w-full text-center justify-center text-xs py-2.5"
          >
            Continuar Explorando
          </Link>
        </div>
      </div>
    </div>
  );
}
