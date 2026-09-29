"use client";

import React, { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export function ThemeToggle({ className = "", showLabel = false }: ThemeToggleProps) {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("falko_theme") as "dark" | "light" | null;
    if (saved === "light" || saved === "dark") {
      setTheme(saved);
      applyTheme(saved);
    } else {
      // Default to dark
      setTheme("dark");
      applyTheme("dark");
    }

    const handleThemeChange = (e: any) => {
      if (e.detail) {
        setTheme(e.detail);
      }
    };
    window.addEventListener("falkoThemeChange", handleThemeChange);
    return () => window.removeEventListener("falkoThemeChange", handleThemeChange);
  }, []);

  const applyTheme = (newTheme: "dark" | "light") => {
    const root = document.documentElement;
    if (newTheme === "light") {
      root.classList.remove("dark");
      root.classList.add("light");
    } else {
      root.classList.remove("light");
      root.classList.add("dark");
    }
  };

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    applyTheme(nextTheme);
    localStorage.setItem("falko_theme", nextTheme);
    window.dispatchEvent(new CustomEvent("falkoThemeChange", { detail: nextTheme }));
  };

  if (!mounted) {
    return (
      <button
        type="button"
        aria-label="Cambiar tema"
        className={`w-9 h-9 rounded-xl flex items-center justify-center border border-white/10 bg-slate-900/80 text-slate-300 ${className}`}
      >
        <Moon className="w-4 h-4 text-cyan-400" />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={theme === "dark" ? "Cambiar a Modo Claro (Solar Aura)" : "Cambiar a Modo Oscuro (Cyber Dark)"}
      aria-label="Alternar modo oscuro y modo claro"
      className={`relative group flex items-center gap-2 px-2.5 py-1.5 rounded-xl border transition-all duration-300 ${
        theme === "dark"
          ? "bg-slate-900/90 hover:bg-slate-800 text-slate-200 border-white/10 hover:border-cyan-500/40 shadow-sm"
          : "bg-white hover:bg-slate-50 text-slate-800 border-slate-200 hover:border-sky-500/40 shadow-sm"
      } ${className}`}
    >
      <div className="relative w-4 h-4 flex items-center justify-center">
        {theme === "dark" ? (
          <Moon className="w-4 h-4 text-cyan-400 transition-transform duration-300 group-hover:-rotate-12" />
        ) : (
          <Sun className="w-4 h-4 text-amber-500 transition-transform duration-300 group-hover:rotate-45" />
        )}
      </div>

      {showLabel && (
        <span className="text-xs font-bold">
          {theme === "dark" ? "Modo Claro" : "Modo Oscuro"}
        </span>
      )}

      <span className="hidden group-hover:inline-block absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-900/95 text-white border border-white/10 rounded-lg text-[10px] font-medium whitespace-nowrap shadow-xl z-50 pointer-events-none">
        {theme === "dark" ? "☀️ Activar Modo Claro" : "🌙 Activar Modo Oscuro"}
      </span>
    </button>
  );
}
