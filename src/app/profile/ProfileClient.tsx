"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  Phone,
  Camera,
  Shield,
  Key,
  Globe,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Save,
  ArrowLeft,
  FileText,
  Upload,
  RefreshCw,
} from "lucide-react";
import { COUNTRIES, CURRENCY_RATES } from "@/lib/currency";

const PRESET_AVATARS = [
  { id: "falcon-neon", name: "Halcón Neón", url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80" },
  { id: "creator-pro", name: "Creador Tech", url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80" },
  { id: "cyber-trader", name: "Cyber Nomad", url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80" },
  { id: "digital-lead", name: "Digital Leader", url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80" },
  { id: "falcon-gold", name: "Halcón Dorado", url: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=200&auto=format&fit=crop&q=80" },
  { id: "growth-maker", name: "Growth Maker", url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80" },
];

interface ProfileClientProps {
  initialUser: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string | null;
    phone?: string | null;
    bio?: string | null;
    countryCode: string;
    preferredCurrency: string;
    roles: string[];
    affiliateCode?: string;
    createdAt: string;
  };
}

export function ProfileClient({ initialUser }: ProfileClientProps) {
  const router = useRouter();

  // Profile Form States
  const [firstName, setFirstName] = useState(initialUser.firstName || "");
  const [lastName, setLastName] = useState(initialUser.lastName || "");
  const [email, setEmail] = useState(initialUser.email || "");
  const [phone, setPhone] = useState(initialUser.phone || "");
  const [bio, setBio] = useState(initialUser.bio || "");
  const [avatarUrl, setAvatarUrl] = useState(initialUser.avatarUrl || "");
  const [countryCode, setCountryCode] = useState(initialUser.countryCode || "US");
  const [preferredCurrency, setPreferredCurrency] = useState(initialUser.preferredCurrency || "USD");

  // Security Form States
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // UI States
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size (< 4MB)
    if (file.size > 4 * 1024 * 1024) {
      setNotification({ type: "error", message: "La imagen debe pesar menos de 4MB." });
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success && data.fileUrl) {
        setAvatarUrl(data.fileUrl);
        setNotification({ type: "success", message: "Foto cargada. Recuerda guardar cambios." });
      } else {
        // Fallback to FileReader base64 if upload endpoint is mock
        const reader = new FileReader();
        reader.onload = () => {
          setAvatarUrl(reader.result as string);
          setNotification({ type: "success", message: "Foto cargada. Recuerda guardar cambios." });
        };
        reader.readAsDataURL(file);
      }
    } catch {
      const reader = new FileReader();
      reader.onload = () => {
        setAvatarUrl(reader.result as string);
        setNotification({ type: "success", message: "Foto cargada. Recuerda guardar cambios." });
      };
      reader.readAsDataURL(file);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setNotification(null);

    if (newPassword) {
      if (newPassword !== confirmPassword) {
        setNotification({ type: "error", message: "La nueva contraseña y su confirmación no coinciden." });
        return;
      }
      if (!currentPassword) {
        setNotification({ type: "error", message: "Debes ingresar tu contraseña actual para cambiarla." });
        return;
      }
    }

    setIsSaving(true);

    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          phone,
          bio,
          avatarUrl,
          countryCode,
          preferredCurrency,
          currentPassword: currentPassword || undefined,
          newPassword: newPassword || undefined,
        }),
      });

      const data = await res.json();

      if (data.success) {
        if (typeof window !== "undefined") {
          localStorage.setItem("falko_currency", preferredCurrency);
          window.dispatchEvent(new CustomEvent("currencyChange", { detail: preferredCurrency }));
        }
        setNotification({ type: "success", message: "¡Perfil y moneda de cuenta guardados exitosamente!" });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        router.refresh();
      } else {
        setNotification({ type: "error", message: data.error || "Error al actualizar perfil." });
      }
    } catch (err: any) {
      setNotification({ type: "error", message: "Error de red al actualizar perfil." });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-cyan-400 mb-3 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Volver a Dashboard
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs uppercase font-bold text-cyan-400 tracking-wider">
                Configuración de Cuenta
              </span>
              <span className="text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-800 px-2 py-0.5 rounded-full font-mono">
                MI PERFIL
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-heading font-black text-white flex items-center gap-2.5">
              <User className="w-7 h-7 text-cyan-400" />
              Personalizar Perfil
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Actualiza tu foto, nombre, teléfono de contacto, correo y preferencias globales en FALKO.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {initialUser.roles.map((r) => (
              <span
                key={r}
                className="text-[10px] font-mono font-bold bg-slate-900 text-cyan-300 px-2.5 py-1 rounded-xl border border-cyan-500/30"
              >
                {r}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div
          className={`p-4 rounded-2xl border flex items-center gap-3 animate-in fade-in zoom-in-95 duration-200 ${
            notification.type === "success"
              ? "bg-emerald-950/60 border-emerald-500/40 text-emerald-300 shadow-glow"
              : "bg-rose-950/60 border-rose-500/40 text-rose-300"
          }`}
        >
          {notification.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          )}
          <span className="text-xs font-semibold">{notification.message}</span>
        </div>
      )}

      <form onSubmit={handleSaveProfile} className="space-y-8">
        {/* Avatar Section */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6">
          <div className="flex items-center gap-2 pb-4 border-b border-white/5">
            <Camera className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold text-white">Foto de Perfil & Avatar</h2>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* Live Avatar Preview */}
            <div className="relative group">
              <div className="w-28 h-28 rounded-3xl bg-gradient-to-tr from-cyan-500 to-blue-600 p-1 shadow-2xl shadow-cyan-500/20">
                <div className="w-full h-full rounded-[22px] bg-slate-950 overflow-hidden flex items-center justify-center text-3xl font-black text-cyan-300">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span>{firstName?.charAt(0) || "U"}</span>
                  )}
                </div>
              </div>
              <label
                htmlFor="avatar-upload"
                className="absolute -bottom-2 -right-2 p-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 cursor-pointer shadow-lg transition-transform hover:scale-110"
                title="Subir archivo de foto"
              >
                <Upload className="w-4 h-4" />
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Custom URL and Presets */}
            <div className="flex-1 space-y-3 w-full">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Enlace directo a imagen (URL externa) o sube tu archivo
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="https://ejemplo.com/mi-foto.jpg"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    className="input-falcon text-xs py-2 w-full font-mono"
                  />
                  {avatarUrl && (
                    <button
                      type="button"
                      onClick={() => setAvatarUrl("")}
                      className="btn-falcon-secondary text-xs px-3 text-slate-400 hover:text-white"
                    >
                      Limpiar
                    </button>
                  )}
                </div>
              </div>

              {/* Preset Avatars */}
              <div>
                <span className="text-[11px] font-semibold text-slate-400 block mb-2">
                  O elige uno de nuestros avatares oficiales de FALKO:
                </span>
                <div className="flex flex-wrap gap-2">
                  {PRESET_AVATARS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => setAvatarUrl(preset.url)}
                      className={`flex items-center gap-1.5 p-1.5 pr-2.5 rounded-xl border text-xs transition-all ${
                        avatarUrl === preset.url
                          ? "bg-cyan-950 border-cyan-500 text-cyan-300 shadow-glow"
                          : "bg-slate-900 border-white/5 text-slate-400 hover:border-white/20 hover:text-white"
                      }`}
                    >
                      <img
                        src={preset.url}
                        alt={preset.name}
                        className="w-5 h-5 rounded-lg object-cover"
                      />
                      <span className="text-[11px] font-medium">{preset.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Personal Details Section */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6">
          <div className="flex items-center gap-2 pb-4 border-b border-white/5">
            <FileText className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold text-white">Información Personal & Contacto</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Nombre *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  placeholder="Tu nombre"
                  className="input-falcon text-xs w-full py-2.5 pl-10"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Apellido *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  placeholder="Tu apellido"
                  className="input-falcon text-xs w-full py-2.5 pl-10"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Correo Electrónico *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="nombre@ejemplo.com"
                  className="input-falcon text-xs w-full py-2.5 pl-10 font-mono"
                />
              </div>
              <span className="text-[10px] text-slate-500 mt-1 block">
                Se usará para iniciar sesión y recibir notificaciones de pagos.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Número de Teléfono / WhatsApp
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+598 99 123 456"
                  className="input-falcon text-xs w-full py-2.5 pl-10 font-mono"
                />
              </div>
              <span className="text-[10px] text-slate-500 mt-1 block">
                Para recibir alertas de ventas instantáneas y contacto de compradores.
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Biografía / Titular Profesional
            </label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Creador digital, experto en comercio electrónico y automatización..."
              className="input-falcon text-xs w-full py-2.5 resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                País de Residencia
              </label>
              <div className="relative">
                <Globe className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <select
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  className="input-falcon text-xs w-full py-2.5 pl-10"
                >
                  {Object.values(COUNTRIES).map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.flag} {c.name} ({c.code})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Moneda Preferida por Defecto
              </label>
              <div className="relative">
                <DollarSign className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <select
                  value={preferredCurrency}
                  onChange={(e) => setPreferredCurrency(e.target.value)}
                  className="input-falcon text-xs w-full py-2.5 pl-10 font-mono"
                >
                  {Object.keys(CURRENCY_RATES).map((curr) => (
                    <option key={curr} value={curr}>
                      {curr} - {CURRENCY_RATES[curr as keyof typeof CURRENCY_RATES].name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Security & Password Change */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6">
          <div className="flex items-center gap-2 pb-4 border-b border-white/5">
            <Key className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold text-white">Seguridad & Cambio de Contraseña</h2>
          </div>

          <p className="text-xs text-slate-400">
            Deja estos campos en blanco si no deseas cambiar tu contraseña actual.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Contraseña Actual
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="input-falcon text-xs w-full py-2.5"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Nueva Contraseña
              </label>
              <input
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="input-falcon text-xs w-full py-2.5"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Confirmar Nueva Contraseña
              </label>
              <input
                type="password"
                placeholder="Repite la contraseña"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input-falcon text-xs w-full py-2.5"
              />
            </div>
          </div>
        </div>

        {/* Submit Bar */}
        <div className="flex items-center justify-between p-4 glass-panel rounded-2xl border border-white/10">
          <span className="text-xs text-slate-400">
            Los cambios se aplicarán inmediatamente en toda la plataforma.
          </span>

          <button
            type="submit"
            disabled={isSaving}
            className="btn-falcon-primary text-xs py-3 px-8 shadow-glow flex items-center gap-2 font-bold"
          >
            {isSaving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Guardando...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Guardar Cambios</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
