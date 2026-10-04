"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FalconLogo } from "@/components/layout/FalconLogo";
import { COUNTRIES, CURRENCY_RATES } from "@/lib/currency";
import { autoDetectAndApplyGeo } from "@/lib/geo";
import {
  Lock,
  Mail,
  User,
  ArrowRight,
  ShieldCheck,
  Phone,
  Sparkles,
  AlertCircle,
} from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    password: "",
    countryCode: "UY",
    preferredCurrency: "USD",
  });

  const [detectedCountryName, setDetectedCountryName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Auto-detectar país y moneda al cargar la página
  useEffect(() => {
    async function initGeo() {
      try {
        const geo = await autoDetectAndApplyGeo();
        if (geo && geo.countryCode && COUNTRIES[geo.countryCode]) {
          setFormData((prev) => ({
            ...prev,
            countryCode: geo.countryCode,
            preferredCurrency: geo.currency,
          }));
          setDetectedCountryName(geo.name);
        }
      } catch (err) {
        console.warn("Geo detection error on register:", err);
      }
    }
    initGeo();
  }, []);

  const activeCountry = COUNTRIES[formData.countryCode] || COUNTRIES["UY"];
  const fullPhone = formData.phoneNumber.trim() ? `${activeCountry.phonePrefix} ${formData.phoneNumber.trim()}` : "";

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

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim() || !formData.password) {
      setError("Por favor completa todos los campos requeridos.");
      return;
    }

    if (!formData.email.includes("@")) {
      setError("Por favor ingresa un correo electrónico válido.");
      return;
    }

    if (formData.password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: fullPhone,
          countryCode: formData.countryCode,
          preferredCurrency: formData.preferredCurrency,
          password: formData.password,
        }),
      });

      const data = await res.json();
      if (data.success) {
        router.push("/dashboard");
        router.refresh();
      } else {
        setError(data.error || "No se pudo registrar la cuenta. Inténtalo nuevamente.");
      }
    } catch {
      setError("Error de conexión al procesar el registro.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="relative max-w-lg w-full">
        {/* Ambient Glow */}
        <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/30 via-purple-600/25 to-blue-600/30 rounded-3xl blur-2xl opacity-70 pointer-events-none" />

        <div className="relative glass-panel rounded-3xl p-8 sm:p-10 border border-white/10 shadow-2xl space-y-6">
          <div className="text-center">
            <FalconLogo size="lg" className="justify-center mb-4" />
            <h2 className="text-2xl sm:text-3xl font-heading font-black text-white">
              Crear Cuenta en FALKO
            </h2>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              Ingresa tus datos para registrarte de forma rápida e inmediata en la plataforma.
            </p>
          </div>

          {/* Detector Badge */}
          {detectedCountryName && (
            <div className="flex items-center justify-center gap-2 bg-cyan-950/40 border border-cyan-500/30 text-cyan-300 text-xs px-3 py-1.5 rounded-full mx-auto w-fit">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>
                País detectado: <strong>{activeCountry.flag} {detectedCountryName}</strong> ({activeCountry.currency})
              </span>
            </div>
          )}

          {error && (
            <div className="bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs p-3.5 rounded-xl flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Nombre</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400" />
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

            {/* Correo Electrónico Único */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400" />
                <input
                  type="email"
                  required
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="tu.correo@ejemplo.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-xs font-semibold"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Cada cuenta debe poseer un correo electrónico único no registrado previamente.
              </p>
            </div>

            {/* País y Moneda */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">País</label>
                <select
                  name="countryCode"
                  value={formData.countryCode}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-slate-200 text-xs focus:outline-none focus:border-cyan-400 font-semibold"
                >
                  {Object.keys(COUNTRIES).map((code) => (
                    <option key={code} value={code}>
                      {COUNTRIES[code].flag} {COUNTRIES[code].name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Moneda Local</label>
                <select
                  name="preferredCurrency"
                  value={formData.preferredCurrency}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-slate-200 text-xs focus:outline-none focus:border-cyan-400 font-mono font-bold"
                >
                  {Object.keys(CURRENCY_RATES).map((code) => (
                    <option key={code} value={code}>
                      {code} ({CURRENCY_RATES[code].symbol})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Teléfono Móvil (Opcional) */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Número de Teléfono Móvil <span className="text-slate-400 font-normal">(Opcional)</span>
              </label>
              <div className="flex items-center gap-2">
                <span className="px-3 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-slate-300 text-xs font-mono font-bold shrink-0 flex items-center gap-1">
                  <span>{activeCountry.flag}</span>
                  <span>{activeCountry.phonePrefix}</span>
                </span>
                <div className="relative flex-1">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    placeholder="99 123 456"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-xs font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Contraseña */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400" />
                <input
                  type="password"
                  required
                  minLength={6}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-xs font-mono"
                />
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
              className="w-full btn-falcon-primary py-3 text-sm font-bold justify-center mt-4 shadow-glow cursor-pointer disabled:opacity-50"
            >
              {loading ? "Creando cuenta..." : "Crear Cuenta en FALKO"}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <p className="text-center text-xs text-slate-400 mt-6 border-t border-white/5 pt-4">
            ¿Ya tienes una cuenta?{" "}
            <Link href="/login" className="text-cyan-400 font-bold hover:underline">
              Iniciar sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
