"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShoppingBag,
  Package,
  Zap,
  Wallet,
  User,
  Home,
  LogIn,
  UserPlus,
  Share2,
} from "lucide-react";

interface MobileBottomNavProps {
  initialUser?: any;
}

export function MobileBottomNav({ initialUser }: MobileBottomNavProps) {
  const pathname = usePathname();
  const [user, setUser] = useState<any>(initialUser || null);

  useEffect(() => {
    if (!initialUser) {
      fetch("/api/auth/me")
        .then((res) => res.json())
        .then((data) => {
          if (data.user) {
            setUser(data.user);
          }
        })
        .catch(() => {});
    }
  }, [initialUser]);

  // Don't show on checkout page to maximize focus on payment
  if (pathname === "/checkout") return null;

  const authNavItems = [
    { label: "Market", href: "/marketplace", icon: ShoppingBag },
    { label: "Cursos", href: "/library", icon: Package },
    { label: "Ventas", href: "/seller", icon: Zap },
    { label: "Billetera", href: "/wallet", icon: Wallet },
    { label: "Perfil", href: "/profile", icon: User },
  ];

  const guestNavItems = [
    { label: "Inicio", href: "/", icon: Home },
    { label: "Market", href: "/marketplace", icon: ShoppingBag },
    { label: "Ingresar", href: "/login", icon: LogIn },
    { label: "Registro", href: "/register", icon: UserPlus },
  ];

  const navItems = user ? authNavItems : guestNavItems;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#05070e]/90 backdrop-blur-2xl border-t border-white/10 shadow-[0_-10px_25px_rgba(0,0,0,0.5)] safe-bottom">
      <div className="flex items-center justify-around h-16 px-2 max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && item.href !== "/marketplace" && pathname?.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 h-full py-1 relative transition-all duration-200 ${
                isActive ? "text-cyan-300" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {/* Active Indicator Top Glow Pill */}
              {isActive && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-b-full shadow-[0_2px_8px_rgba(6,182,212,0.8)]" />
              )}

              <div
                className={`p-1.5 rounded-xl transition-all duration-200 ${
                  isActive
                    ? "bg-cyan-950/80 border border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.3)] scale-110"
                    : "bg-transparent"
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? "text-cyan-300" : "text-slate-400"}`} />
              </div>

              <span
                className={`text-[10px] font-medium mt-0.5 tracking-tight ${
                  isActive ? "font-bold text-cyan-300" : "text-slate-400"
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
