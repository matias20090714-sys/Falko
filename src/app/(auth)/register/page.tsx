"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FalconLogo } from "@/components/layout/FalconLogo";
import { COUNTRIES, CURRENCY_RATES } from "@/lib/currency";
import { Lock, Mail, User, Globe, ArrowRight, ShieldCheck } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    countryCode: "UY",
    preferredCurrency: "USD",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === "countryCode") {
      const country = COUNTRIES[value];
      setFormData((prev) => ({
        ...prev,
        countryCode: value,
        preferredCurrency: country ? country.currency : prev.preferredCurrency,
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        router.push("/dashboard");
        router.refresh();
      } else {
        setError(data.error || "Error al registrar la cuenta.");
      }
    } catch {
      setError("Error de conexión.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-lg w-full glass-panel rounded-3xl p-8 border border-slate-800 shadow-glow relative">
        <div className="text-center mb-8">
          <FalconLogo size="lg" className="justify-center mb-4" />
          <h2 className="text-2xl font-heading font-black text-white">Crear Cuenta en FALKO</h2>
          <p className="text-xs text-slate-400 mt-1">
            Tu pasaporte único para comprar, vender y afiliarte a nivel internacional.
          </p>
        </div>

        {error && (
          <div className="mb-4 bg-rose-950/50 border border-rose-800/80 text-rose-300 text-xs p-3 rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Nombre</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="Juan"
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl glass-input text-xs"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Apellido</label>
              <input
                type="text"
                required
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Pérez"
                className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Correo Electrónico</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email"
                required
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="juan.perez@empresa.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-xs"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Contraseña</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="password"
                required
                minLength={6}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Mínimo 6 caracteres"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">País</label>
              <select
                name="countryCode"
                value={formData.countryCode}
                onChange={handleChange}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-cyan-400"
              >
                {Object.keys(COUNTRIES).map((code) => (
                  <option key={code} value={code}>
                    {COUNTRIES[code].flag} {COUNTRIES[code].name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Moneda Preferida</label>
              <select
                name="preferredCurrency"
                value={formData.preferredCurrency}
                onChange={handleChange}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-cyan-400 font-mono"
              >
                {Object.keys(CURRENCY_RATES).map((code) => (
                  <option key={code} value={code}>
                    {code} ({CURRENCY_RATES[code].symbol})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 flex items-start gap-2 pt-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>
              Al registrarte aceptas los{" "}
              <Link href="/terms" className="text-cyan-400 hover:underline">
                Términos de Servicio
              </Link>{" "}
              y la{" "}
              <Link href="/privacy" className="text-cyan-400 hover:underline">
                Política de Privacidad
              </Link>{" "}
              de FALKO.
            </span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-falcon-primary py-3 text-sm font-bold justify-center mt-4 shadow-glow"
          >
            {loading ? "Creando tu cuenta..." : "Comenzar en FALKO"}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <p className="text-center text-xs text-slate-400 mt-6">
          ¿Ya tienes una cuenta?{" "}
          <Link href="/login" className="text-cyan-400 font-bold hover:underline">
            Iniciar sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
