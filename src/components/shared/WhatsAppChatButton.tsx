"use client";

import React from "react";
import { MessageCircle, ExternalLink } from "lucide-react";

import { COUNTRIES } from "@/lib/currency";

interface WhatsAppChatButtonProps {
  sellerPhone?: string | null;
  sellerName: string;
  sellerCountryCode?: string | null;
  productTitle: string;
  className?: string;
  variant?: "floating" | "button" | "card";
}

export function WhatsAppChatButton({
  sellerPhone,
  sellerName,
  sellerCountryCode,
  productTitle,
  className = "",
  variant = "button",
}: WhatsAppChatButtonProps) {
  // Normalize and format the WhatsApp phone number
  let rawPhone = (sellerPhone || "").trim();
  let digitsOnly = rawPhone.replace(/[^0-9]/g, "");

  if (digitsOnly) {
    const countryPrefix = sellerCountryCode && COUNTRIES[sellerCountryCode]
      ? COUNTRIES[sellerCountryCode].phonePrefix.replace(/[^0-9]/g, "")
      : "598"; // default to Uruguay prefix if not specified

    // If starts with 0 (e.g., local 099123456 or 011...)
    if (digitsOnly.startsWith("0")) {
      digitsOnly = countryPrefix + digitsOnly.substring(1);
    } else if (digitsOnly.length <= 9 && !rawPhone.startsWith("+") && !digitsOnly.startsWith(countryPrefix)) {
      // Local number without country code
      digitsOnly = countryPrefix + digitsOnly;
    }
  }

  const targetPhone = digitsOnly || "59899123456";

  const messageText = `Hola ${sellerName}! Tengo una consulta sobre "${productTitle}" en FALKO.`;
  const whatsappUrl = `https://wa.me/${targetPhone}?text=${encodeURIComponent(messageText)}`;

  if (variant === "floating") {
    return (
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={`fixed bottom-20 right-4 z-40 bg-[#25D366] hover:bg-[#20ba59] text-slate-950 font-bold p-3 sm:px-4 sm:py-2.5 rounded-full shadow-2xl flex items-center gap-2 text-xs transition-all hover:scale-105 group border border-white/20 ${className}`}
        title="Chatear con el creador por WhatsApp"
      >
        <MessageCircle className="w-5 h-5 text-slate-950 fill-current" />
        <span className="hidden sm:inline">¿Dudas? Hablar por WhatsApp</span>
      </a>
    );
  }

  if (variant === "card") {
    return (
      <div className={`bg-emerald-950/30 border border-emerald-500/30 rounded-2xl p-4 space-y-2.5 ${className}`}>
        <div className="flex items-center gap-2">
          <MessageCircle className="w-4 h-4 text-emerald-400" />
          <strong className="text-xs text-white">¿Tienes dudas antes de comprar?</strong>
        </div>
        <p className="text-[11px] text-slate-300 leading-relaxed">
          Consulta directamente con el creador ({sellerName}) por WhatsApp para resolver cualquier consulta sobre el producto.
        </p>
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-falcon-secondary w-full justify-center text-xs py-2 bg-emerald-950/60 border-emerald-500/40 text-emerald-300 hover:text-emerald-200 flex items-center gap-1.5"
        >
          <MessageCircle className="w-3.5 h-3.5" />
          <span>Consultar por WhatsApp</span>
        </a>
      </div>
    );
  }

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`btn-falcon-secondary text-xs py-2 px-3 flex items-center gap-1.5 text-emerald-300 border-emerald-500/30 hover:border-emerald-400 ${className}`}
    >
      <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
      <span>Consultar por WhatsApp</span>
    </a>
  );
}
