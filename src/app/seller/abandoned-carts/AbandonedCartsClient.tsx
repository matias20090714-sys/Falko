"use client";

import React, { useState } from "react";
import Link from "next/link";
import { formatCurrency } from "@/lib/currency";
import {
  Check,
  Clock,
  Copy,
  DollarSign,
  ExternalLink,
  Flame,
  Mail,
  MessageCircle,
  Percent,
  RefreshCw,
  Search,
  Send,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  Zap,
} from "lucide-react";

interface AbandonedCartsClientProps {
  pendingOrders: any[];
  products: any[];
  sellerName: string;
}

export function AbandonedCartsClient({
  pendingOrders,
  products,
  sellerName,
}: AbandonedCartsClientProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedProductSlug, setSelectedProductSlug] = useState(products[0]?.slug || "");
  const [customCoupon, setCustomCoupon] = useState("RECUPERA10");
  const [copiedCustomLink, setCopiedCustomLink] = useState(false);

  const totalPotentialRevenue = pendingOrders.reduce(
    (acc, o) => acc + (o.totalAmount || 0),
    0
  );

  const handleCopyRecoveryLink = (order: any) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "https://falko.dpdns.org";
    const productSlug = order.items?.[0]?.product?.slug || "";
    const link = `${origin}/checkout?product=${productSlug}&coupon=RECUPERA10&email=${encodeURIComponent(order.buyer?.email || "")}`;
    navigator.clipboard.writeText(link);
    setCopiedId(order.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const getWhatsAppRecoveryUrl = (order: any) => {
    const buyerPhone = order.buyer?.phone || "";
    const buyerName = order.buyer?.firstName || "Hola";
    const productTitle = order.items?.[0]?.product?.title || "tu producto digital";
    const origin = typeof window !== "undefined" ? window.location.origin : "https://falko.dpdns.org";
    const productSlug = order.items?.[0]?.product?.slug || "";
    const recoveryLink = `${origin}/checkout?product=${productSlug}&coupon=RECUPERA10`;

    const text = encodeURIComponent(
      `¡Hola ${buyerName}! 👋 Soy ${sellerName} de FALKO. Vi que estuviste interesado en adquirir "${productTitle}". Para ayudarte a comenzar hoy mismo, te preparé un cupón especial del 10% OFF: ${recoveryLink} ¿Tienes alguna duda antes de realizar tu compra?`
    );

    const cleanPhone = buyerPhone.replace(/[^0-9]/g, "");
    return `https://wa.me/${cleanPhone}?text=${text}`;
  };

  const getEmailRecoveryUrl = (order: any) => {
    const buyerEmail = order.buyer?.email || "";
    const buyerName = order.buyer?.firstName || "Hola";
    const productTitle = order.items?.[0]?.product?.title || "tu producto digital";
    const origin = typeof window !== "undefined" ? window.location.origin : "https://falko.dpdns.org";
    const productSlug = order.items?.[0]?.product?.slug || "";
    const recoveryLink = `${origin}/checkout?product=${productSlug}&coupon=RECUPERA10`;

    const subject = encodeURIComponent(`Completa tu orden de ${productTitle} con 10% OFF`);
    const body = encodeURIComponent(
      `Hola ${buyerName},\n\nNotamos que no pudiste completar tu orden para "${productTitle}".\n\nQueremos asegurarnos de que no te pierdas esta oportunidad, por lo que hemos activado un descuento especial del 10% válido por las próximas 24 horas.\n\nPuedes acceder y completar tu orden aquí:\n${recoveryLink}\n\nSi necesitas ayuda con algún medio de pago, solo responde este correo.\n\nSaludos,\n${sellerName} — FALKO`
    );

    return `mailto:${buyerEmail}?subject=${subject}&body=${body}`;
  };

  return (
    <div className="space-y-8">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-amber-500/30 bg-amber-950/20 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-300">Carritos por Recuperar</span>
            <ShoppingCart className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white font-mono">
            {pendingOrders.length}
          </div>
          <span className="text-[11px] text-amber-400/90 font-medium block mt-1">
            Prospectos con intención de compra
          </span>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-emerald-500/30 bg-emerald-950/20 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-300">Ingresos Recuperables</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">
            {formatCurrency(totalPotentialRevenue, "USD")}
          </div>
          <span className="text-[11px] text-emerald-300/90 font-medium block mt-1">
            Facturación potencial estimada
          </span>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-cyan-500/30 bg-cyan-950/20 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-300">Tasa de Cierre con Descuento</span>
            <Zap className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-cyan-300 font-mono">
            +32.4%
          </div>
          <span className="text-[11px] text-cyan-400/90 font-medium block mt-1">
            Incremento promedio usando cupones
          </span>
        </div>
      </div>

      {/* Quick Recovery Link Generator Widget */}
      <div className="glass-panel p-6 sm:p-7 rounded-3xl border border-white/10 space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-cyan-400" />
          <h2 className="text-lg font-bold text-white">Generador de Enlace de Recuperación con Descuento</h2>
        </div>
        <p className="text-xs text-slate-400">
          Crea un enlace directo de checkout con cupón de descuento preaplicado para compartir en tus campañas de email, historias de Instagram o WhatsApp.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-300 block">Producto:</label>
            <select
              value={selectedProductSlug}
              onChange={(e) => setSelectedProductSlug(e.target.value)}
              className="input-falcon w-full text-xs"
            >
              {products.map((p) => (
                <option key={p.id} value={p.slug}>
                  {p.title} (${p.price} {p.currencyCode})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-300 block">Código de Cupón:</label>
            <input
              type="text"
              value={customCoupon}
              onChange={(e) => setCustomCoupon(e.target.value.toUpperCase())}
              placeholder="RECUPERA10"
              className="input-falcon w-full text-xs font-mono font-bold"
            />
          </div>

          <div className="flex items-end">
            <button
              type="button"
              onClick={() => {
                const origin = typeof window !== "undefined" ? window.location.origin : "https://falko.dpdns.org";
                const link = `${origin}/checkout?product=${selectedProductSlug}&coupon=${customCoupon.trim() || "RECUPERA10"}`;
                navigator.clipboard.writeText(link);
                setCopiedCustomLink(true);
                setTimeout(() => setCopiedCustomLink(false), 2500);
              }}
              className="btn-falcon-primary w-full text-xs py-2.5 px-4 font-bold flex items-center justify-center gap-1.5 shadow-glow"
            >
              {copiedCustomLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-slate-950" />
                  <span>¡Enlace Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copiar Enlace de Checkout</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* List of Abandoned Checkouts */}
      <div className="glass-panel rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-heading font-bold text-white">
              Prospectos Pendientes ({pendingOrders.length})
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Contacta a tus clientes antes de que expire su interés de compra.
            </p>
          </div>
        </div>

        {pendingOrders.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <ShoppingBag className="w-12 h-12 text-slate-600 mx-auto" />
            <h4 className="text-sm font-bold text-white">No tienes carritos abandonados actualmente</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              ¡Excelente trabajo! Todos tus prospectos recientes han completado sus compras con normalidad.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-white/5 overflow-x-auto">
            {pendingOrders.map((order) => {
              const product = order.items?.[0]?.product;
              const isCopied = copiedId === order.id;

              return (
                <div
                  key={order.id}
                  className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-white/[0.02] transition-colors"
                >
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">
                        {order.buyer?.firstName} {order.buyer?.lastName}
                      </span>
                      <span className="text-[10px] bg-amber-950 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold">
                        Pago Pendiente
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 flex items-center gap-2 truncate">
                      <span className="text-cyan-400 font-bold">{product?.title || "Producto"}</span>
                      <span>•</span>
                      <span className="font-mono text-emerald-400 font-bold">
                        {formatCurrency(order.totalAmount, order.currencyCode)}
                      </span>
                    </p>

                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
                      {order.buyer?.email && (
                        <span className="flex items-center gap-1 font-mono">
                          <Mail className="w-3 h-3 text-slate-500" />
                          {order.buyer.email}
                        </span>
                      )}
                      {order.buyer?.phone && (
                        <span className="flex items-center gap-1 font-mono">
                          <MessageCircle className="w-3 h-3 text-emerald-400" />
                          {order.buyer.phone}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Quick Action Buttons */}
                  <div className="flex items-center gap-2 shrink-0">
                    {order.buyer?.phone && (
                      <a
                        href={getWhatsAppRecoveryUrl(order)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 text-xs px-3 py-2 rounded-xl flex items-center gap-1.5 font-bold transition-all"
                        title="Enviar mensaje de WhatsApp con descuento"
                      >
                        <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                        <span>WhatsApp</span>
                      </a>
                    )}

                    {order.buyer?.email && (
                      <a
                        href={getEmailRecoveryUrl(order)}
                        className="bg-slate-900 hover:bg-slate-800 border border-white/10 text-slate-200 text-xs px-3 py-2 rounded-xl flex items-center gap-1.5 font-medium transition-all"
                        title="Enviar correo de recuperación"
                      >
                        <Mail className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Email</span>
                      </a>
                    )}

                    <button
                      type="button"
                      onClick={() => handleCopyRecoveryLink(order)}
                      className="btn-falcon-primary text-xs py-2 px-3 font-bold flex items-center gap-1.5 shadow-glow"
                    >
                      {isCopied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-slate-950" />
                          <span>¡Copiado!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Link 10% OFF</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
