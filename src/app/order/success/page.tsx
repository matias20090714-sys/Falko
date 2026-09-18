import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { CheckCircle2, Download, ExternalLink, FileText, Lock, Mail, Package, ShieldCheck, Sparkles } from "lucide-react";
import { formatCurrency } from "@/lib/currency";

export default async function OrderSuccessPage({
  searchParams,
}: {
  searchParams: { orderNumber?: string; email?: string };
}) {
  const orderNumber = searchParams.orderNumber;
  const queryEmail = searchParams.email;

  let order: any = null;
  if (orderNumber) {
    try {
      order = await prisma.order.findUnique({
        where: { orderNumber },
        include: {
          buyer: true,
          items: {
            include: {
              product: {
                include: {
                  files: true,
                },
              },
            },
          },
        },
      });
    } catch (err) {
      console.warn("OrderSuccessPage query fallback:", err);
    }
  }

  const buyerEmail = order?.buyer?.email || queryEmail;
  const purchasedProduct = order?.items?.[0]?.product;

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-xl w-full glass-panel rounded-3xl p-6 sm:p-8 border border-emerald-500/40 text-center shadow-glow relative space-y-6">
        <div className="w-16 h-16 rounded-full bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mx-auto">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <div>
          <span className="text-xs uppercase font-black text-emerald-400 tracking-wider block mb-1">
            ¡Pago Confirmado Exitosamente!
          </span>
          <h1 className="text-2xl sm:text-3xl font-heading font-black text-white">
            Gracias por tu compra en FALKO
          </h1>
        </div>

        {/* Email Delivery Confirmation Box */}
        {buyerEmail && (
          <div className="bg-cyan-950/40 border border-cyan-500/40 rounded-2xl p-4 text-xs text-left flex items-start gap-3 shadow-sm">
            <Mail className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white block font-bold">Entrega Inmediata Enviada por Correo:</strong>
              <p className="text-slate-300 leading-relaxed mt-0.5">
                Hemos enviado tu comprobante de orden y los accesos privados a{" "}
                <span className="font-mono text-cyan-300 font-bold">{buyerEmail}</span>.
              </p>
            </div>
          </div>
        )}

        {/* Order Details Receipt Box */}
        {order ? (
          <div className="bg-slate-950/70 border border-white/10 rounded-2xl p-5 text-left space-y-3 text-xs">
            <div className="flex justify-between pb-3 border-b border-white/5">
              <span className="text-slate-400">Número de Orden:</span>
              <span className="font-mono font-bold text-white">{order.orderNumber}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-400">Producto Adquirido:</span>
              <span className="font-bold text-white truncate max-w-[240px]">
                {purchasedProduct?.title || "Recurso Digital"}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-400">Total Pagado:</span>
              <span className="font-mono font-bold text-cyan-400 text-sm">
                {formatCurrency(order.totalAmount, order.currencyCode)}
              </span>
            </div>

            <div className="flex justify-between pt-2 border-t border-white/5 text-emerald-400">
              <span className="flex items-center gap-1 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                Garantía Activa:
              </span>
              <span>{order.guaranteeDays} días (hasta {new Date(order.guaranteeReleaseDate).toLocaleDateString()})</span>
            </div>
          </div>
        ) : (
          <p className="text-xs text-slate-400">
            Tu orden ha sido procesada con éxito y tus archivos digitales se encuentran listos para descargar.
          </p>
        )}

        {/* Immediate Deliverable: External Access Link or Files */}
        {purchasedProduct && (
          <div className="bg-slate-950/90 border border-emerald-500/30 rounded-2xl p-5 text-left space-y-3.5 shadow-lg">
            <div className="flex items-center gap-2 text-emerald-300 font-bold text-xs pb-2 border-b border-white/5">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Accesos Inmediatos de tu Producto:</span>
            </div>

            {purchasedProduct.accessUrl && (
              <div className="space-y-2">
                <a
                  href={purchasedProduct.accessUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-falcon-primary w-full text-center justify-center text-xs py-3 font-bold flex items-center gap-1.5 shadow-glow"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Abrir Acceso / Plataforma Privada</span>
                </a>
                {purchasedProduct.accessInstructions && (
                  <p className="text-[11px] text-slate-300 bg-slate-900/80 p-3 rounded-xl border border-white/5 whitespace-pre-line leading-relaxed">
                    <strong>Instrucciones:</strong> {purchasedProduct.accessInstructions}
                  </p>
                )}
              </div>
            )}

            {purchasedProduct.files && purchasedProduct.files.length > 0 && (
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-slate-300 block">
                  Archivos Digitales Disponibles:
                </span>
                <div className="space-y-1.5">
                  {purchasedProduct.files.map((file: any) => (
                    <div
                      key={file.id || file.fileName}
                      className="bg-slate-900/90 border border-white/10 p-3 rounded-xl flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <FileText className="w-4 h-4 text-cyan-400 shrink-0" />
                        <span className="font-semibold text-white truncate max-w-[180px]">
                          {file.fileName}
                        </span>
                      </div>
                      <Link
                        href="/library"
                        className="btn-falcon-primary text-[10px] py-1 px-3 flex items-center gap-1 font-bold shrink-0"
                      >
                        <Download className="w-3 h-3" />
                        <span>Descargar</span>
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2.5 pt-2">
          <Link
            href="/library"
            className="btn-falcon-primary w-full text-center justify-center text-xs sm:text-sm py-3.5 shadow-glow font-bold flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>Acceder a Mi Biblioteca Digital</span>
          </Link>

          <Link
            href="/marketplace"
            className="btn-falcon-secondary w-full text-center justify-center text-xs py-2.5"
          >
            Explorar Más Productos en el Marketplace
          </Link>
        </div>
      </div>
    </div>
  );
}
