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
  Trophy,
  User,
  Wallet,
  Menu,
  X,
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
    // Check session via API if not passed from SSR
    if (!initialUser) {
      fetch("/api/auth/me")
        .then((res) => res.json())
        .then((data) => {
          if (data.user) {
            setUser(data.user);
            if (data.user.preferredCurrency) {
              setSelectedCurrency(data.user.preferredCurrency);
            }
          }
        })
        .catch(() => {});
    }
  }, [initialUser]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.push("/");
    router.refresh();
  };

  const navLinks = [
    { label: "Marketplace", href: "/marketplace", icon: ShoppingBag },
    { label: "Cómo Funciona", href: "/#como-funciona", icon: null },
  ];

  return (
    <nav className="sticky top-0 z-40 w-full bg-[#070b14]/90 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <FalconLogo size="md" />

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-medium transition-colors duration-150 flex items-center gap-1.5 ${
                    isActive ? "text-cyan-400 font-semibold" : "text-slate-300 hover:text-white"
                  }`}
                >
                  {Icon && <Icon className="w-4 h-4 text-cyan-400" />}
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
                className="flex items-center gap-1.5 text-xs font-mono font-semibold bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-700/80 px-2.5 py-1.5 rounded-lg transition-all"
              >
                <Globe className="w-3.5 h-3.5 text-cyan-400" />
                <span>{selectedCurrency}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {isCurrencyOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl py-2 z-50 max-h-64 overflow-y-auto">
                  <div className="px-3 py-1 text-[10px] uppercase font-bold text-slate-400 border-b border-slate-800">
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
                          // Trigger custom event for multi-currency reactive pricing
                          if (typeof window !== "undefined") {
                            localStorage.setItem("falko_currency", currCode);
                            window.dispatchEvent(new CustomEvent("currencyChange", { detail: currCode }));
                          }
                        }}
                        className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-slate-800 ${
                          selectedCurrency === currCode ? "text-cyan-400 font-bold bg-cyan-950/30" : "text-slate-300"
                        }`}
                      >
                        <span className="font-mono">{c.symbol} {c.code}</span>
                        <span className="text-[10px] text-slate-500 truncate max-w-[90px]">{c.name}</span>
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
                    className="text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all"
                  >
                    <PlusCircle className="w-3.5 h-3.5 text-cyan-400" />
                    Crear Producto
                  </Link>
                ) : (
                  <Link
                    href="/seller"
                    className="text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all"
                  >
                    Activar Modo Vendedor
                  </Link>
                )}

                {/* User Dropdown Menu */}
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 transition-all"
                  >
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-xs font-bold text-white shadow-sm overflow-hidden">
                      {user.avatarUrl ? (
                        <img src={user.avatarUrl} alt={user.firstName} className="w-full h-full object-cover" />
                      ) : (
                        user.firstName?.charAt(0) || "U"
                      )}
                    </div>
                    <span className="text-xs font-semibold text-slate-200 max-w-[100px] truncate">
                      {user.firstName}
                    </span>
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                  </button>

                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl py-2 z-50">
                      <div className="px-4 py-2 border-b border-slate-800">
                        <p className="text-xs font-bold text-white truncate">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {userRoles.map((r: string) => (
                            <span
                              key={r}
                              className="text-[9px] font-mono font-bold bg-slate-800 text-cyan-400 px-1.5 py-0.5 rounded border border-slate-700"
                            >
                              {r}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="py-1">
                        <Link
                          href="/dashboard"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-800"
                        >
                          <LayoutDashboard className="w-4 h-4 text-cyan-400" />
                          Dashboard Principal
                        </Link>
                        <Link
                          href="/library"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-800"
                        >
                          <Package className="w-4 h-4 text-emerald-400" />
                          Mis Compras & Biblioteca
                        </Link>
                        <Link
                          href="/seller"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-800"
                        >
                          <ShoppingBag className="w-4 h-4 text-blue-400" />
                          Panel de Vendedor
                        </Link>
                        <Link
                          href="/affiliate"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-800"
                        >
                          <Share2 className="w-4 h-4 text-purple-400" />
                          Panel de Afiliado
                        </Link>
                        <Link
                          href="/wallet"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-800"
                        >
                          <Wallet className="w-4 h-4 text-amber-400" />
                          Billetera & Retiros
                        </Link>
                        {userRoles.includes("ADMIN") && (
                          <Link
                            href="/admin"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-xs text-rose-400 font-bold hover:bg-rose-950/30"
                          >
                            <Shield className="w-4 h-4" />
                            Panel Administrador
                          </Link>
                        )}
                      </div>

                      <div className="pt-1 border-t border-slate-800">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-rose-400 hover:bg-slate-800 text-left"
                        >
                          <LogOut className="w-4 h-4" />
                          Cerrar Sesión
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="text-xs font-semibold text-slate-300 hover:text-white px-3 py-2 rounded-lg transition-colors"
                >
                  Iniciar Sesión
                </Link>
                <Link href="/register" className="btn-falcon-primary text-xs py-2 px-3.5">
                  Crear Cuenta
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg bg-slate-900 text-slate-300 hover:text-white"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-slate-950 border-b border-slate-800 px-4 pt-2 pb-6 space-y-3">
          <div className="space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="block py-2 text-sm font-medium text-slate-300 hover:text-cyan-400"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {user ? (
            <div className="pt-3 border-t border-slate-800 space-y-2">
              <p className="text-xs text-slate-400">Conectado como <strong>{user.firstName}</strong></p>
              <Link
                href="/dashboard"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block py-1.5 text-sm text-cyan-400"
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
            <div className="pt-3 border-t border-slate-800 grid grid-cols-2 gap-2">
              <Link
                href="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="btn-falcon-secondary text-xs text-center justify-center py-2"
              >
                Iniciar Sesión
              </Link>
              <Link
                href="/register"
                onClick={() => setIsMobileMenuOpen(false)}
                className="btn-falcon-primary text-xs text-center justify-center py-2"
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
