import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { processOrderLedger } from "@/lib/ledger";
import { CheckCircle2, Download, ExternalLink, FileText, Clock, Mail, ShieldCheck, Sparkles, Zap, AlertTriangle } from "lucide-react";
import { formatCurrency } from "@/lib/currency";

export default async function OrderSuccessPage({
  searchParams,
}: {
  searchParams: { orderNumber?: string; email?: string; payment_id?: string; status?: string };
}) {
  const orderNumber = searchParams.orderNumber;
  const queryEmail = searchParams.email;
  const paymentIdParam = searchParams.payment_id;

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
          affiliateProduct: {
            include: {
              affiliateProfile: true,
            },
          },
        },
      });
    } catch (err) {
      console.warn("OrderSuccessPage query fallback:", err);
    }
  }

  // If order is PENDING, attempt live verification with Mercado Pago API before granting access
  if (order && order.status === "PENDING") {
    const token = process.env.MERCADOPAGO_ACCESS_TOKEN;
    const checkPaymentId = order.paymentProviderId || paymentIdParam;

    if (token && checkPaymentId && !checkPaymentId.startsWith("temp_")) {
      try {
        const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${checkPaymentId}`, {
          headers: { Authorization: `Bearer ${token.trim()}` },
          cache: "no-store",
        });

        if (mpRes.ok) {
          const mpData = await mpRes.json();
          if (mpData.status === "approved") {
            // Confirm Order and process ledger
            const affiliateUserId = order.affiliateProduct?.affiliateProfile?.userId || null;
            await prisma.order.update({
              where: { id: order.id },
              data: {
                status: "CONFIRMED",
                payments: {
                  updateMany: {
                    where: { orderId: order.id },
                    data: { status: "CONFIRMED", rawResponseJson: JSON.stringify(mpData) },
                  },
                },
              },
            });

            await processOrderLedger({
              orderId: order.id,
              sellerId: order.items[0]?.product?.sellerId,
              sellerAmount: order.sellerEarningAmount,
              affiliateUserId,
              affiliateAmount: order.affiliateCommissionAmount,
              platformFeeAmount: order.platformFeeConverted,
              currencyCode: order.currencyCode,
              guaranteeDays: order.guaranteeDays,
            });

            order.status = "CONFIRMED";
          }
        }
      } catch (err) {
        console.warn("Live MP verification error on success page:", err);
      }
    }
  }

  const isConfirmed = order?.status === "CONFIRMED";
  const buyerEmail = order?.buyer?.email || queryEmail;
  const purchasedProduct = order?.items?.[0]?.product;

  // Render PENDING / UNVERIFIED UI if payment is not confirmed
  if (order && !isConfirmed) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center px-4 py-16">
        <div className="max-w-xl w-full glass-panel rounded-3xl p-6 sm:p-8 border border-amber-500/40 text-center shadow-glow relative space-y-6">
          <div className="w-16 h-16 rounded-full bg-amber-950/80 border border-amber-500/40 flex items-center justify-center text-amber-400 mx-auto">
            <Clock className="w-8 h-8 animate-pulse" />
          </div>

          <div>
            <span className="text-xs uppercase font-black text-amber-400 tracking-wider block mb-1">
              Pago Pendiente de Verificación
            </span>
            <h1 className="text-2xl sm:text-3xl font-heading font-black text-white">
              Esperando Confirmación de Mercado Pago
            </h1>
          </div>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-slate-950/70 p-4 rounded-2xl border border-white/10">
            Tu orden <strong className="font-mono text-amber-300">{order.orderNumber}</strong> aún no ha sido confirmada por Mercado Pago. Tan pronto como tu pago sea acreditado, tus archivos y accesos se activarán en tu Biblioteca.
          </p>

          <div className="space-y-2.5 pt-2">
            <Link
              href={`/checkout?product=${purchasedProduct?.slug || ""}`}
              className="btn-falcon-primary w-full text-center justify-center text-xs sm:text-sm py-3.5 shadow-glow font-bold flex items-center gap-2"
            >
              <Zap className="w-4 h-4" />
              <span>Completar o Reintentar Pago</span>
            </Link>

            <Link
              href="/marketplace"
              className="btn-falcon-secondary w-full text-center justify-center text-xs py-2.5"
            >
              Volver al Marketplace
            </Link>
          </div>
        </div>
      </div>
    );
  }

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

        {/* 1-Click Post-Purchase Upsell (OTO) Offer */}
        {purchasedProduct?.upsellTitle && purchasedProduct?.upsellPrice && (
          <div className="bg-gradient-to-br from-amber-950/60 via-slate-950 to-purple-950/40 border-2 border-amber-500/50 rounded-2xl p-5 text-left space-y-3.5 shadow-2xl relative overflow-hidden animate-in fade-in-50">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider bg-amber-500 text-slate-950 px-2 py-0.5 rounded-md">
                ⚡ Oferta Exclusiva Post-Compra (Solo por esta sesión)
              </span>
              <span className="text-xs font-mono font-bold text-amber-300">
                ${parseFloat(purchasedProduct.upsellPrice).toFixed(2)} USD
              </span>
            </div>

            <div>
              <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-1.5">
                <span>{purchasedProduct.upsellTitle}</span>
              </h3>
              {purchasedProduct.upsellDescription && (
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  {purchasedProduct.upsellDescription}
                </p>
              )}
            </div>

            {purchasedProduct.upsellFileUrl ? (
              <a
                href={purchasedProduct.upsellFileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-falcon-primary w-full text-center justify-center text-xs py-3 font-bold flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 hover:opacity-90 shadow-glow"
              >
                <Zap className="w-4 h-4 text-slate-950" />
                <span>Añadir Oferta con 1-Clic (${parseFloat(purchasedProduct.upsellPrice).toFixed(2)} USD)</span>
              </a>
            ) : (
              <Link
                href={`/checkout?product=${purchasedProduct.slug}&upsell=1`}
                className="btn-falcon-primary w-full text-center justify-center text-xs py-3 font-bold flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 hover:opacity-90 shadow-glow"
              >
                <Zap className="w-4 h-4 text-slate-950" />
                <span>Añadir Oferta con 1-Clic (${parseFloat(purchasedProduct.upsellPrice).toFixed(2)} USD)</span>
              </Link>
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
