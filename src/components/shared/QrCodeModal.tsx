"use client";

import React, { useState } from "react";
import { QrCode, Copy, Check, Download, X, Share2, Sparkles, MessageCircle } from "lucide-react";

interface QrCodeModalProps {
  productTitle: string;
  productSlug: string;
  refCode?: string;
}

export function QrCodeModal({ productTitle, productSlug, refCode }: QrCodeModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const origin = typeof window !== "undefined" ? window.location.origin : "https://falko.io";
  const shareUrl = `${origin}/product/${productSlug}${refCode ? `?ref=${refCode}` : ""}`;

  // Use reliable quick QR generation service
  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
    shareUrl
  )}&color=06b6d4&bgcolor=05070e&margin=15`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleWhatsAppShare = () => {
    const text = `¡Mira este recurso digital en FALKO! "${productTitle}":\n${shareUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="btn-falcon-secondary text-xs py-1.5 px-3 flex items-center gap-1.5 text-cyan-300 border-cyan-500/30 hover:border-cyan-400"
        title="Ver Código QR y Compartir en Redes"
      >
        <QrCode className="w-3.5 h-3.5 text-cyan-400" />
        <span>Código QR & Compartir</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-[#05070e] border border-cyan-500/40 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5 text-center relative overflow-hidden">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-900"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 text-[10px] font-mono font-bold mb-2">
                <QrCode className="w-3 h-3 text-cyan-400" />
                <span>ESCANEABLE CON CÁMARA DE CELULAR</span>
              </div>
              <h3 className="text-lg font-bold text-white line-clamp-1">{productTitle}</h3>
              <p className="text-xs text-slate-400 mt-1">
                Ideal para proyectar en presentaciones, imprimir o colocar en historias de Instagram/TikTok.
              </p>
            </div>

            {/* QR Code Container */}
            <div className="w-56 h-56 mx-auto rounded-2xl bg-[#05070e] border-2 border-cyan-500/40 p-3 shadow-glow flex items-center justify-center relative group">
              <img
                src={qrApiUrl}
                alt="Código QR del Producto"
                className="w-full h-full object-contain rounded-xl"
              />
            </div>

            {/* Direct Link Box */}
            <div className="bg-slate-950/80 p-2.5 rounded-xl border border-white/10 flex items-center justify-between gap-2 text-xs">
              <span className="font-mono text-[11px] text-slate-300 truncate text-left flex-1">
                {shareUrl}
              </span>
              <button
                type="button"
                onClick={handleCopy}
                className="btn-falcon-primary text-[11px] py-1 px-3 shrink-0"
              >
                {copied ? <Check className="w-3 h-3 text-black" /> : <Copy className="w-3 h-3 text-black" />}
                <span>{copied ? "Copiado" : "Copiar"}</span>
              </button>
            </div>

            {/* Quick Share Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={handleWhatsAppShare}
                className="btn-falcon-secondary text-xs py-2.5 px-3 justify-center bg-[#25D366]/10 border-[#25D366]/40 text-[#25D366] hover:bg-[#25D366]/20 flex items-center gap-1.5 font-bold"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp</span>
              </button>

              <a
                href={qrApiUrl}
                download={`qr_falko_${productSlug}.png`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-falcon-secondary text-xs py-2.5 px-3 justify-center text-cyan-300 border-cyan-500/40 flex items-center gap-1.5"
              >
                <Download className="w-4 h-4 text-cyan-400" />
                <span>Descargar QR</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
