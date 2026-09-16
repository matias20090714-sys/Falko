"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingBag,
  PlusCircle,
  Users,
  Share2,
  Package,
  Wallet,
  Webhook,
  GraduationCap,
  Sparkles,
  User,
  Shield,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Zap,
  Menu,
  X,
  Store,
  Trophy,
  TrendingUp,
  ArrowUpRight,
} from "lucide-react";

interface DashboardSidebarProps {
  user: any;
}

export function DashboardSidebar({ user }: DashboardSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const userRoles: string[] = Array.isArray(user?.roles) ? user.roles : [];

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  };

  const navGroups = [
    {
      title: "EXPLORAR & MERCADO",
      items: [
        {
          label: "Marketplace",
          href: "/marketplace",
          icon: Store,
          color: "text-cyan-400",
        },
      ],
    },
    {
      title: "PANEL PRINCIPAL",
      items: [
        {
          label: "Dashboard Resumen",
          href: "/dashboard",
          icon: LayoutDashboard,
          color: "text-cyan-400",
        },
      ],
    },
    {
      title: "VENTAS & CREADOR",
      items: [
        {
          label: "Mis Productos en Venta",
          href: "/seller",
          icon: ShoppingBag,
          color: "text-blue-400",
        },
        {
          label: "Crear Nuevo Producto",
          href: "/seller/products/new",
          icon: PlusCircle,
          color: "text-emerald-400",
        },
        {
          label: "Mis Afiliados (Vendedores)",
          href: "/seller/affiliates",
          icon: Users,
          color: "text-purple-400",
        },
        {
          label: "Webhooks & CRMs",
          href: "/seller/webhooks",
          icon: Webhook,
          color: "text-cyan-400",
        },
        {
          label: "Academia de Creadores",
          href: "/seller/academy",
          icon: GraduationCap,
          color: "text-amber-400",
        },
      ],
    },
    {
      title: "AFILIACIÓN & COMPRAS",
      items: [
        {
          label: "Mercado de Afiliación",
          href: "/affiliate/products",
          icon: TrendingUp,
          color: "text-purple-400",
        },
        {
          label: "Mis Afiliaciones & Links",
          href: "/affiliate",
          icon: Share2,
          color: "text-purple-400",
        },
        {
          label: "Mis Compras & Cursos",
          href: "/library",
          icon: Package,
          color: "text-emerald-400",
        },
      ],
    },
    {
      title: "FINANZAS & CUENTA",
      items: [
        {
          label: "Billetera & Retiros",
          href: "/wallet",
          icon: Wallet,
          color: "text-amber-400",
        },
        {
          label: "Historial de Retiros",
          href: "/withdrawals",
          icon: ArrowUpRight,
          color: "text-emerald-400",
        },
        {
          label: "Editar Mi Perfil",
          href: "/profile",
          icon: User,
          color: "text-cyan-400",
        },
        {
          label: "Pásate a FALKO (Migrar)",
          href: "/migrate",
          icon: Sparkles,
          color: "text-rose-400",
        },
      ],
    },
  ];

  if (userRoles.includes("ADMIN")) {
    navGroups.push({
      title: "ADMINISTRACIÓN",
      items: [
        {
          label: "Panel Administrador",
          href: "/admin",
          icon: Shield,
          color: "text-rose-400",
        },
      ],
    });
  }

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#05070e] border-r border-white/10 text-slate-300 select-none">
      {/* Top Header / Profile Badge */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-xs font-black text-slate-950 shrink-0 shadow-glow">
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt="" className="w-full h-full object-cover rounded-xl" />
            ) : (
              <span>{user?.firstName?.charAt(0) || "F"}</span>
            )}
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <span className="text-xs font-bold text-white block truncate leading-tight">
                {user?.firstName} {user?.lastName}
              </span>
              <span className="text-[10px] text-cyan-400 font-mono block truncate">
                {user?.email}
              </span>
            </div>
          )}
        </Link>

        {/* Desktop Collapse Toggle */}
        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          className="hidden md:flex p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-slate-900 transition-colors"
          title={collapsed ? "Expandir barra lateral" : "Colapsar barra lateral"}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>

        {/* Mobile Close Button */}
        <button
          type="button"
          onClick={() => setMobileOpen(false)}
          className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation Groups List */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6 touch-momentum">
        {navGroups.map((group, idx) => (
          <div key={idx} className="space-y-1">
            {!collapsed && (
              <span className="px-3 text-[9px] uppercase font-mono font-bold tracking-wider text-slate-500 block mb-1.5">
                {group.title}
              </span>
            )}

            {group.items.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/seller" && item.href !== "/dashboard" && pathname?.startsWith(item.href));
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  title={collapsed ? item.label : undefined}
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs transition-all duration-150 group relative ${
                    isActive
                      ? "bg-cyan-950/80 text-cyan-300 font-bold border border-cyan-500/40 shadow-glow"
                      : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                      isActive ? "text-cyan-400" : item.color
                    }`}
                  />
                  {!collapsed && <span className="truncate">{item.label}</span>}

                  {/* Active Indicator Glow Pill on Left */}
                  {isActive && !collapsed && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,1)]" />
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      {/* Bottom Profile & Logout Bar */}
      <div className="p-3 border-t border-white/10 bg-slate-950/60 space-y-1">
        <Link
          href="/profile"
          onClick={() => setMobileOpen(false)}
          className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs transition-colors ${
            pathname === "/profile"
              ? "bg-cyan-950 text-cyan-300 font-bold border border-cyan-500/40"
              : "text-slate-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <User className="w-4 h-4 text-cyan-400 shrink-0" />
          {!collapsed && <span>Mi Perfil & Ajustes</span>}
        </Link>

        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-rose-400 hover:bg-rose-950/20 transition-colors text-left"
        >
          <LogOut className="w-4 h-4 text-rose-400 shrink-0" />
          {!collapsed && <span>Cerrar Sesión</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Floating Toggle Button */}
      <div className="md:hidden fixed top-20 left-4 z-30">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="p-2.5 rounded-2xl bg-slate-900/90 backdrop-blur-xl border border-white/15 text-cyan-400 shadow-2xl flex items-center gap-1.5 text-xs font-bold"
        >
          <Menu className="w-4 h-4" />
          <span>Panel Lateral</span>
        </button>
      </div>

      {/* Mobile Backdrop Drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative w-72 max-w-[80vw] h-full shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}

      {/* Desktop Persistent Sidebar */}
      <aside
        className={`hidden md:block shrink-0 transition-all duration-200 ${
          collapsed ? "w-16" : "w-64"
        }`}
      >
        <div className="sticky top-16 h-[calc(100vh-4rem)]">
          {sidebarContent}
        </div>
      </aside>
    </>
  );
}
