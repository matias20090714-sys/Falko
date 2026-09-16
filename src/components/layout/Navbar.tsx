"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FalconLogo } from "./FalconLogo";
import { COUNTRIES, CURRENCY_RATES } from "@/lib/currency";
import {
  Bell,
  ChevronDown,
  Globe,
  LayoutDashboard,
  LogOut,
  Package,
  PlusCircle,
  Share2,
  Shield,
  ShoppingBag,
  Sparkles,
  Trophy,
  User,
  Wallet,
  Menu,
  X,
  Zap,
  Webhook,
} from "lucide-react";

interface NavbarProps {
  initialUser?: any;
}

export function Navbar({ initialUser }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(initialUser || null);
  const userRoles: string[] = Array.isArray(user?.roles) ? user.roles : [];
  const [selectedCurrency, setSelectedCurrency] = useState("USD");
  const [isCurrencyOpen, setIsCurrencyOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Check saved currency in local storage
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("falko_currency");
      if (saved) {
        setSelectedCurrency(saved);
      }
    }

    const handleCurrencyChange = (e: any) => {
      if (e.detail) {
        setSelectedCurrency(e.detail);
      }
    };

    window.addEventListener("currencyChange", handleCurrencyChange);

    // Check session via API if not passed from SSR
    if (!initialUser) {
      fetch("/api/auth/me")
        .then((res) => res.json())
        .then((data) => {
          if (data.user) {
            setUser(data.user);
            if (data.user.preferredCurrency && !localStorage.getItem("falko_currency")) {
              setSelectedCurrency(data.user.preferredCurrency);
              localStorage.setItem("falko_currency", data.user.preferredCurrency);
            }
          }
        })
        .catch(() => {});
    }

    return () => window.removeEventListener("currencyChange", handleCurrencyChange);
  }, [initialUser]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.push("/");
    router.refresh();
  };

  const navLinks = user
    ? [
        { label: "Marketplace", href: "/marketplace", icon: ShoppingBag },
        { label: "Panel de Ventas", href: "/seller", icon: Zap },
      ]
    : [{ label: "Cómo Funciona", href: "/#como-funciona", icon: null }];

  return (
    <nav className="sticky top-0 z-40 w-full bg-[#05070e]/85 backdrop-blur-2xl border-b border-white/[0.08] shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo with Glow Effect */}
          <FalconLogo size="md" />

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-2">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-xs font-semibold px-3.5 py-2 rounded-xl transition-all duration-200 flex items-center gap-1.5 ${
                    isActive
                      ? "bg-cyan-950/70 text-cyan-300 border border-cyan-500/40 shadow-glow"
                      : "text-slate-300 hover:text-white hover:bg-white/[0.04]"
                  }`}
                >
                  {Icon && <Icon className="w-3.5 h-3.5 text-cyan-400" />}
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Right Controls: Currency, Quick Actions, Auth */}
          <div className="hidden md:flex items-center gap-3">
            {/* Currency Selector */}
            <div className="relative">
              <button
                onClick={() => setIsCurrencyOpen(!isCurrencyOpen)}
                className="flex items-center gap-1.5 text-xs font-mono font-semibold bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-white/10 hover:border-cyan-500/40 px-3 py-1.5 rounded-xl transition-all shadow-sm"
              >
                <Globe className="w-3.5 h-3.5 text-cyan-400" />
                <span>{selectedCurrency}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {isCurrencyOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl py-2 z-50 max-h-72 overflow-y-auto">
                  <div className="px-3.5 py-1.5 text-[10px] uppercase font-bold text-slate-400 border-b border-white/5 font-mono">
                    Selecciona Moneda
                  </div>
                  {Object.keys(CURRENCY_RATES).map((currCode) => {
                    const c = CURRENCY_RATES[currCode];
                    return (
                      <button
                        key={currCode}
                        onClick={() => {
                          setSelectedCurrency(currCode);
                          setIsCurrencyOpen(false);
                          if (typeof window !== "undefined") {
                            localStorage.setItem("falko_currency", currCode);
                            window.dispatchEvent(new CustomEvent("currencyChange", { detail: currCode }));
                          }
                        }}
                        className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between hover:bg-white/5 transition-colors ${
                          selectedCurrency === currCode ? "text-cyan-400 font-bold bg-cyan-950/40" : "text-slate-300"
                        }`}
                      >
                        <span className="font-mono font-bold">{c.symbol} {c.code}</span>
                        <span className="text-[10px] text-slate-400 truncate max-w-[100px]">{c.name}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {user ? (
              <>
                {/* Quick Switch to Seller or Affiliate */}
                {userRoles.includes("SELLER") ? (
                  <Link
                    href="/seller/products/new"
                    className="text-xs font-bold bg-gradient-to-r from-cyan-500/20 to-blue-500/20 hover:from-cyan-500/30 hover:to-blue-500/30 text-cyan-300 border border-cyan-500/40 px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 transition-all shadow-glow"
                  >
                    <PlusCircle className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Crear Producto</span>
                  </Link>
                ) : (
                  <Link
                    href="/seller"
                    className="text-xs font-semibold bg-slate-900/90 hover:bg-slate-800 text-slate-300 border border-white/10 px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 transition-all"
                  >
                    <span>Activar Modo Vendedor</span>
                  </Link>
                )}

                {/* User Dropdown Menu */}
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2.5 p-1.5 pr-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-white/10 hover:border-cyan-500/30 transition-all shadow-sm"
                  >
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-xs font-black text-slate-950 shadow-sm overflow-hidden">
                      {user.avatarUrl ? (
                        <img src={user.avatarUrl} alt={user.firstName} className="w-full h-full object-cover" />
                      ) : (
                        user.firstName?.charAt(0) || "U"
                      )}
                    </div>
                    <span className="text-xs font-bold text-white max-w-[100px] truncate">
                      {user.firstName}
                    </span>
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                  </button>

                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-60 bg-slate-900/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                      <div className="px-4 py-2.5 border-b border-white/5">
                        <p className="text-xs font-bold text-white truncate">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {userRoles.map((r: string) => (
                            <span
                              key={r}
                              className="text-[9px] font-mono font-bold bg-slate-950 text-cyan-400 px-2 py-0.5 rounded-md border border-cyan-500/30"
                            >
                              {r}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="py-1.5 space-y-0.5">
                        <Link
                          href="/dashboard"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                        >
                          <LayoutDashboard className="w-4 h-4 text-cyan-400" />
                          <span>Dashboard Principal</span>
                        </Link>
                        <Link
                          href="/library"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                        >
                          <Package className="w-4 h-4 text-emerald-400" />
                          <span>Mis Compras & Biblioteca</span>
                        </Link>
                        <Link
                          href="/seller"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                        >
                          <ShoppingBag className="w-4 h-4 text-blue-400" />
                          <span>Panel de Vendedor</span>
                        </Link>
                        <Link
                          href="/seller/webhooks"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs text-cyan-300 hover:text-cyan-200 hover:bg-cyan-950/30 transition-colors"
                        >
                          <Webhook className="w-4 h-4 text-cyan-400" />
                          <span>Webhooks & Automatización</span>
                        </Link>
                        <Link
                          href="/affiliate"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                        >
                          <Share2 className="w-4 h-4 text-purple-400" />
                          <span>Panel de Afiliado</span>
                        </Link>
                        <Link
                          href="/wallet"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                        >
                          <Wallet className="w-4 h-4 text-amber-400" />
                          <span>Billetera & Retiros</span>
                        </Link>
                        <Link
                          href="/profile"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs text-cyan-300 font-semibold hover:bg-white/5 transition-colors"
                        >
                          <User className="w-4 h-4 text-cyan-400" />
                          <span>Mi Perfil & Ajustes</span>
                        </Link>
                        {userRoles.includes("ADMIN") && (
                          <Link
                            href="/admin"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-xs text-rose-400 font-bold hover:bg-rose-950/40 transition-colors"
                          >
                            <Shield className="w-4 h-4" />
                            <span>Panel Administrador</span>
                          </Link>
                        )}
                      </div>

                      <div className="pt-1.5 border-t border-white/5">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-rose-400 hover:bg-rose-950/20 text-left transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Cerrar Sesión</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2.5">
                <Link
                  href="/login"
                  className="btn-falcon-secondary text-xs py-2 px-4"
                >
                  Iniciar Sesión
                </Link>
                <Link href="/register" className="btn-falcon-primary text-xs py-2 px-4 shadow-glow">
                  Crear Cuenta
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-xl bg-slate-900 border border-white/10 text-slate-300 hover:text-white"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-slate-950/95 backdrop-blur-2xl border-b border-white/10 px-4 pt-3 pb-6 space-y-3">
          <div className="space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="block py-2 text-sm font-semibold text-slate-200 hover:text-cyan-400"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {user ? (
            <div className="pt-3 border-t border-white/10 space-y-2">
              <p className="text-xs text-slate-400">Conectado como <strong className="text-white">{user.firstName}</strong></p>
              <Link
                href="/dashboard"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block py-1.5 text-sm text-cyan-400 font-semibold"
              >
                Mi Dashboard
              </Link>
              <Link
                href="/library"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block py-1.5 text-sm text-slate-300"
              >
                Mis Compras
              </Link>
              <Link
                href="/seller"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block py-1.5 text-sm text-slate-300"
              >
                Panel Vendedor
              </Link>
              <Link
                href="/seller/webhooks"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block py-1.5 text-sm text-cyan-300 font-semibold"
              >
                ⚡ Webhooks & CRMs
              </Link>
              <Link
                href="/affiliate"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block py-1.5 text-sm text-slate-300"
              >
                Panel Afiliado
              </Link>
              <Link
                href="/wallet"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block py-1.5 text-sm text-slate-300"
              >
                Billetera & Retiros
              </Link>
              <Link
                href="/profile"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block py-1.5 text-sm text-cyan-300 font-semibold"
              >
                👤 Mi Perfil & Ajustes
              </Link>
              {userRoles.includes("ADMIN") && (
                <Link
                  href="/admin"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block py-1.5 text-sm text-rose-400 font-bold"
                >
                  Panel Administrador
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="w-full text-left py-1.5 text-sm text-rose-400 font-semibold"
              >
                Cerrar Sesión
              </button>
            </div>
          ) : (
            <div className="pt-3 border-t border-white/10 grid grid-cols-2 gap-2">
              <Link
                href="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="btn-falcon-secondary text-xs text-center justify-center py-2.5"
              >
                Iniciar Sesión
              </Link>
              <Link
                href="/register"
                onClick={() => setIsMobileMenuOpen(false)}
                className="btn-falcon-primary text-xs text-center justify-center py-2.5 shadow-glow"
              >
                Crear Cuenta
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
