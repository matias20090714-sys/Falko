"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Check } from "lucide-react";

export function RoleToggleButtons({ role, userHasRole }: { role: "SELLER" | "AFFILIATE"; userHasRole: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleActivate = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/toggle-role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });

      const data = await res.json();
      if (data.success) {
        router.refresh();
      } else {
        alert(data.error || "No se pudo activar el rol.");
      }
    } catch {
      alert("Error al conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleActivate}
      disabled={loading}
      className={`w-full text-xs py-2.5 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-md ${
        role === "SELLER"
          ? "btn-falcon-primary shadow-glow"
          : "bg-purple-600 hover:bg-purple-500 text-white shadow-glow"
      }`}
    >
      <Sparkles className="w-3.5 h-3.5" />
      {loading ? "Activando..." : `Activar Modo ${role === "SELLER" ? "Vendedor" : "Afiliado"} Ahora`}
    </button>
  );
}
