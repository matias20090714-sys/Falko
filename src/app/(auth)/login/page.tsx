"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FalconLogo } from "@/components/layout/FalconLogo";
import { Lock, Mail, ArrowRight, Sparkles, ShieldCheck } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (data.success) {
        router.push(redirect);
        router.refresh();
      } else {
        setError(data.error || "Credenciales inválidas.");
      }
    } catch {
      setError("Error de conexión con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative max-w-md w-full">
      {/* Background glow behind login card */}
      <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/30 to-blue-600/30 rounded-3xl blur-2xl opacity-70 pointer-events-none" />

      <div className="relative glass-panel rounded-3xl p-8 sm:p-10 border border-white/10 shadow-2xl space-y-6">
        <div className="text-center">
          <FalconLogo size="lg" className="justify-center mb-5" />
          <h2 className="text-2xl sm:text-3xl font-heading font-black text-white">Iniciar Sesión</h2>
          <p className="text-xs text-slate-400 mt-1.5">
            Accede a tu panel y gestiona tus operaciones en FALKO
          </p>
        </div>

        {error && (
          <div className="bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs p-3.5 rounded-xl flex items-center gap-2">
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">Correo Electrónico</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@correo.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-xs"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-semibold text-slate-300">Contraseña</label>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-xs font-mono"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-falcon-primary py-3 text-sm font-bold justify-center mt-2 shadow-glow cursor-pointer"
          >
            {loading ? "Verificando..." : "Ingresar a FALKO"}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-2 border-t border-white/5 text-center">
          <p className="text-xs text-slate-400">
            ¿No tienes una cuenta?{" "}
            <Link href="/register" className="text-cyan-400 font-bold hover:underline">
              Crear cuenta gratuita
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <Suspense fallback={<div className="text-slate-400 text-xs">Cargando acceso...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
