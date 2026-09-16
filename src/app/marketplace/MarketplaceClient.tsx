"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { formatCurrency, convertCurrency } from "@/lib/currency";
import {
  ArrowRight,
  Filter,
  Percent,
  Search,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  Tag,
  TrendingUp,
  X,
  Zap,
} from "lucide-react";

interface MarketplaceClientProps {
  initialProducts: any[];
  categories: any[];
  initialCategory: string;
  initialSearch: string;
  initialSort: string;
}

export function MarketplaceClient({
  initialProducts,
  categories,
  initialCategory,
  initialSearch,
  initialSort,
}: MarketplaceClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedSort, setSelectedSort] = useState(initialSort);
  const [currency, setCurrency] = useState("USD");

  useEffect(() => {
    const saved = localStorage.getItem("falko_currency");
    if (saved) setCurrency(saved);

    const handleCurrencyChange = (e: any) => {
      setCurrency(e.detail);
    };

    window.addEventListener("currencyChange", handleCurrencyChange);
    return () => window.removeEventListener("currencyChange", handleCurrencyChange);
  }, []);

  const handleApplyFilter = (newCategory?: string, newSort?: string) => {
    const cat = newCategory !== undefined ? newCategory : selectedCategory;
    const srt = newSort !== undefined ? newSort : selectedSort;

    const params = new URLSearchParams();
    if (cat) params.set("category", cat);
    if (search.trim()) params.set("search", search.trim());
    if (srt && srt !== "popular") params.set("sort", srt);

    router.push(`/marketplace?${params.toString()}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleApplyFilter();
  };

  return (
    <div className="space-y-8">
      {/* Marketplace Welcome & Creator Banner */}
      <div className="glass-panel p-6 sm:p-7 rounded-3xl border border-white/10 bg-gradient-to-r from-slate-950 via-cyan-950/20 to-slate-950 flex flex-col md:flex-row items-center justify-between gap-5 shadow-2xl">
        <div className="space-y-1 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2">
            <span className="text-[10px] font-mono uppercase font-bold text-cyan-400 bg-cyan-950/80 px-2.5 py-0.5 rounded-full border border-cyan-800/60">
              🛡️ GARANTÍA PROTEGIDA FALKO
            </span>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800/40 hidden sm:inline-block">
              ⚡ Entrega Digital Inmediata
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-black text-white">
            Explora los Mejores Productos Digitales
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            Cursos, software, prompts de IA y plantillas creadas por los mejores productores de la comunidad.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5 justify-center shrink-0">
          <Link
            href="/seller/products/new"
            className="btn-falcon-primary text-xs py-2.5 px-5 shadow-glow flex items-center gap-1.5 font-bold"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Vender mi Producto</span>
          </Link>
          <Link
            href="/migrate"
            className="btn-falcon-secondary text-xs py-2.5 px-4 text-slate-300"
          >
            Pásate a FALKO
          </Link>
        </div>
      </div>

      {/* Search & Sort Toolbar */}
      <div className="glass-panel p-4 sm:p-5 rounded-2xl border border-white/10 flex flex-col md:flex-row gap-4 justify-between items-center shadow-xl">
        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:max-w-lg">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por software, plantillas, prompts, creador..."
            className="w-full pl-10 pr-10 py-2.5 rounded-xl glass-input text-xs"
          />
          {search && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                const params = new URLSearchParams(searchParams.toString());
                params.delete("search");
                router.push(`/marketplace?${params.toString()}`);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </form>

        {/* Sort selector */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <span className="text-xs text-slate-400 whitespace-nowrap font-mono">Ordenar por:</span>
          <select
            value={selectedSort}
            onChange={(e) => {
              setSelectedSort(e.target.value);
              handleApplyFilter(selectedCategory, e.target.value);
            }}
            className="bg-slate-900 border border-white/10 text-slate-200 text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-cyan-400 font-semibold"
          >
            <option value="popular">Más Populares / Ventas</option>
            <option value="newest">Más Recientes</option>
            <option value="price-asc">Menor Precio</option>
            <option value="price-desc">Mayor Precio</option>
          </select>
        </div>
      </div>

      {/* Category Pills Slider */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
        <button
          onClick={() => {
            setSelectedCategory("");
            handleApplyFilter("", selectedSort);
          }}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
            !selectedCategory
              ? "bg-cyan-950/90 text-cyan-300 border-2 border-cyan-400 shadow-glow font-bold"
              : "bg-slate-900/90 text-slate-300 border border-white/10 hover:border-cyan-500/40 hover:text-white"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Todos los Productos ({initialProducts.length})</span>
        </button>

        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.slug;
          return (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedCategory(cat.slug);
                handleApplyFilter(cat.slug, selectedSort);
              }}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                isSelected
                  ? "bg-cyan-950/90 text-cyan-300 border-2 border-cyan-400 shadow-glow font-bold"
                  : "bg-slate-900/90 text-slate-300 border border-white/10 hover:border-cyan-500/40 hover:text-white"
              }`}
            >
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>

      {/* Products Grid */}
      {initialProducts.length === 0 ? (
        <div className="glass-panel rounded-3xl p-12 text-center border border-white/10 my-8 max-w-2xl mx-auto shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mx-auto mb-4 shadow-glow">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-heading font-black text-white mb-2">
            El mercado está listo para nuevos productos
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto mb-6 leading-relaxed">
            Aún no se han publicado recursos en esta categoría. ¿Eres creador o desarrollador? ¡Publica tu producto digital ahora!
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/seller/products/new"
              className="btn-falcon-primary text-xs py-2.5 px-6 shadow-glow"
            >
              Publicar Producto Digital
            </Link>
            {selectedCategory && (
              <button
                onClick={() => {
                  setSearch("");
                  setSelectedCategory("");
                  router.push("/marketplace");
                }}
                className="btn-falcon-secondary text-xs py-2.5 px-5"
              >
                Ver Todas las Categorías
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {initialProducts.map((p) => {
            const convertedPrice = convertCurrency(p.price, p.currencyCode, currency);

            return (
              <Link
                key={p.id}
                href={`/product/${p.slug}`}
                className="group glass-panel rounded-2xl overflow-hidden border border-white/10 hover:border-cyan-500/50 transition-all duration-300 flex flex-col hover:-translate-y-1.5 shadow-xl hover:shadow-glow"
              >
                {/* Product Cover */}
                <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-950">
                  <img
                    src={p.coverImageUrl}
                    alt={p.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 bg-slate-950/85 backdrop-blur-md text-[10px] font-bold text-cyan-300 px-2.5 py-1 rounded-lg border border-white/10 shadow-sm">
                    {p.category.name}
                  </div>
                  {p.affiliateEnabled && (
                    <div className="absolute top-3 right-3 bg-purple-950/90 backdrop-blur-md text-[10px] font-bold text-purple-300 px-2.5 py-1 rounded-lg border border-purple-800/70 flex items-center gap-1 shadow-sm">
                      <Percent className="w-3 h-3" />
                      {p.affiliateCommissionPct}% Afiliado
                    </div>
                  )}
                  <div className="absolute bottom-3 right-3 bg-slate-950/90 text-[10px] text-emerald-400 font-semibold px-2 py-0.5 rounded-md border border-emerald-900/60 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    Garantía {p.guaranteeDays}d
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="text-base font-heading font-bold text-white group-hover:text-cyan-400 transition-colors line-clamp-2 mb-1.5">
                      {p.title}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {p.shortDescription || p.description}
                    </p>
                  </div>

                  <div>
                    {/* Rating & Sales */}
                    <div className="flex items-center justify-between text-xs text-slate-400 pb-3 mb-3 border-b border-white/5">
                      <div className="flex items-center gap-1 text-amber-400 font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <span>{p.ratingAvg.toFixed(1)}</span>
                        <span className="text-slate-500 font-normal">({p.reviewsCount})</span>
                      </div>
                      <span className="text-slate-400 text-[11px] font-mono">
                        {p.salesCount} ventas
                      </span>
                    </div>

                    {/* Footer: Seller & Price */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-800 overflow-hidden border border-white/10">
                          {p.seller.avatarUrl ? (
                            <img src={p.seller.avatarUrl} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-cyan-800 flex items-center justify-center text-[10px] text-white font-bold">
                              {p.seller.firstName[0]}
                            </div>
                          )}
                        </div>
                        <span className="text-xs text-slate-300 truncate max-w-[100px] font-semibold">
                          {p.seller.firstName} {p.seller.lastName?.[0]}.
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-base font-black font-mono text-cyan-400">
                          {formatCurrency(convertedPrice, currency)}
                        </span>
                        {currency !== p.currencyCode && (
                          <span className="text-[10px] text-slate-500 block font-mono">
                            Base: {formatCurrency(p.price, p.currencyCode)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
