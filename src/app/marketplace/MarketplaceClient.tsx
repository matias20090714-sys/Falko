"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { formatCurrency, convertCurrency } from "@/lib/currency";
import {
  Filter,
  Percent,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Tag,
  TrendingUp,
  X,
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
    <div>
      {/* Search & Sort Toolbar */}
      <div className="glass-panel rounded-2xl p-4 mb-8 border border-slate-800 flex flex-col md:flex-row gap-4 justify-between items-center">
        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por título, temas, autor..."
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
          <label className="text-xs text-slate-400 whitespace-nowrap">Ordenar por:</label>
          <select
            value={selectedSort}
            onChange={(e) => {
              setSelectedSort(e.target.value);
              handleApplyFilter(selectedCategory, e.target.value);
            }}
            className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-cyan-400"
          >
            <option value="popular">Más Populares / Ventas</option>
            <option value="newest">Más Recientes</option>
            <option value="price-asc">Menor Precio</option>
            <option value="price-desc">Mayor Precio</option>
          </select>
        </div>
      </div>

      {/* Category Pills Slider */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 no-scrollbar">
        <button
          onClick={() => {
            setSelectedCategory("");
            handleApplyFilter("", selectedSort);
          }}
          className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
            !selectedCategory
              ? "bg-cyan-500 text-slate-950 shadow-glow font-bold"
              : "bg-slate-900 text-slate-300 border border-slate-800 hover:border-slate-700"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          Todos los Productos ({initialProducts.length})
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
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                isSelected
                  ? "bg-cyan-500 text-slate-950 shadow-glow font-bold"
                  : "bg-slate-900 text-slate-300 border border-slate-800 hover:border-slate-700"
              }`}
            >
              {cat.name}
            </button>
          );
        })}
      </div>

      {/* Products Grid */}
      {initialProducts.length === 0 ? (
        <div className="glass-panel rounded-2xl p-12 text-center border border-slate-800 my-8">
          <Tag className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-white mb-1">No se encontraron productos</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mb-6">
            Intenta cambiar los filtros de búsqueda o seleccionar otra categoría para descubrir más recursos digitales.
          </p>
          <button
            onClick={() => {
              setSearch("");
              setSelectedCategory("");
              router.push("/marketplace");
            }}
            className="btn-falcon-primary text-xs py-2 px-4"
          >
            Restablecer Filtros
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {initialProducts.map((p) => {
            // Price conversion if active user selected different currency
            const convertedPrice = convertCurrency(p.price, p.currencyCode, currency);

            return (
              <Link
                key={p.id}
                href={`/product/${p.slug}`}
                className="group glass-panel rounded-2xl overflow-hidden border border-slate-800/80 hover:border-cyan-500/50 transition-all flex flex-col hover:-translate-y-1 shadow-md hover:shadow-glow"
              >
                {/* Product Cover */}
                <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-900">
                  <img
                    src={p.coverImageUrl}
                    alt={p.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 bg-slate-950/85 backdrop-blur-md text-[10px] font-bold text-cyan-300 px-2 py-0.5 rounded border border-slate-800">
                    {p.category.name}
                  </div>
                  {p.affiliateEnabled && (
                    <div className="absolute top-3 right-3 bg-purple-950/90 backdrop-blur-md text-[10px] font-bold text-purple-300 px-2 py-0.5 rounded border border-purple-800/70 flex items-center gap-1">
                      <Percent className="w-3 h-3" />
                      {p.affiliateCommissionPct}% Afiliado
                    </div>
                  )}
                  <div className="absolute bottom-3 right-3 bg-slate-950/90 text-[10px] text-emerald-400 font-semibold px-2 py-0.5 rounded border border-emerald-900/60 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    Garantía {p.guaranteeDays}d
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-base font-bold text-white group-hover:text-cyan-400 transition-colors line-clamp-2 mb-2">
                      {p.title}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-2 mb-4">
                      {p.shortDescription || p.description}
                    </p>
                  </div>

                  <div>
                    {/* Rating & Sales */}
                    <div className="flex items-center justify-between text-xs text-slate-400 pb-3 mb-3 border-b border-slate-800/70">
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
                        <div className="w-6 h-6 rounded-full bg-slate-800 overflow-hidden">
                          {p.seller.avatarUrl ? (
                            <img src={p.seller.avatarUrl} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-cyan-800 flex items-center justify-center text-[10px] text-white font-bold">
                              {p.seller.firstName[0]}
                            </div>
                          )}
                        </div>
                        <span className="text-xs text-slate-300 truncate max-w-[90px]">
                          {p.seller.firstName}
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
