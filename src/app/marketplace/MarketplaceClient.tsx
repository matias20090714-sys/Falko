"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { formatCurrency, convertCurrency } from "@/lib/currency";
import {
  ArrowRight,
  Check,
  Copy,
  ExternalLink,
  Filter,
  Lock,
  Percent,
  Search,
  Share2,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  Tag,
  TrendingUp,
  UserPlus,
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
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Affiliate Action Modal State
  const [affiliateModalProduct, setAffiliateModalProduct] = useState<any>(null);
  const [affiliateLoading, setAffiliateLoading] = useState(false);
  const [affiliateLinkResult, setAffiliateLinkResult] = useState<string | null>(null);
  const [affiliateError, setAffiliateError] = useState<string>("");
  const [copiedAffiliate, setCopiedAffiliate] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("falko_currency");
    if (saved) setCurrency(saved);

    const handleCurrencyChange = (e: any) => {
      setCurrency(e.detail);
    };

    window.addEventListener("currencyChange", handleCurrencyChange);

    // Check user auth state
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) setCurrentUser(data.user);
      })
      .catch(() => {});

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

  const handleOpenAffiliateModal = async (product: any) => {
    setAffiliateModalProduct(product);
    setAffiliateLinkResult(null);
    setAffiliateError("");
    setCopiedAffiliate(false);

    if (currentUser) {
      setAffiliateLoading(true);
      try {
        const res = await fetch("/api/affiliates/generate-link", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId: product.id }),
        });

        const data = await res.json();
        if (data.success && data.affiliateProduct) {
          const origin = typeof window !== "undefined" ? window.location.origin : "https://falko.dpdns.org";
          const link = `${origin}/product/${product.slug}?ref=${data.affiliateProduct.uniqueRefCode}`;
          setAffiliateLinkResult(link);
        } else {
          setAffiliateError(data.error || "No se pudo generar el enlace de afiliado.");
        }
      } catch {
        setAffiliateError("Error al comunicarse con el servidor.");
      } finally {
        setAffiliateLoading(false);
      }
    }
  };

  const handleCopyLink = () => {
    if (!affiliateLinkResult) return;
    navigator.clipboard.writeText(affiliateLinkResult);
    setCopiedAffiliate(true);
    setTimeout(() => setCopiedAffiliate(false), 2500);
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
            <span>Publicar mi Producto</span>
          </Link>
          <Link
            href="/affiliate"
            className="btn-falcon-secondary text-xs py-2.5 px-4 flex items-center gap-1.5 font-bold"
          >
            <Percent className="w-3.5 h-3.5 text-purple-400" />
            <span>Panel de Afiliados</span>
          </Link>
        </div>
      </div>

      {/* Search & Filtering Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-white/10 space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Input */}
          <form onSubmit={handleSearchSubmit} className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por título, temática, software o autor..."
              className="w-full pl-10 pr-10 py-2 rounded-xl glass-input text-xs"
            />
            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  const params = new URLSearchParams();
                  if (selectedCategory) params.set("category", selectedCategory);
                  if (selectedSort !== "popular") params.set("sort", selectedSort);
                  router.push(`/marketplace?${params.toString()}`);
                }}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </form>

          {/* Sort Selector */}
          <div className="flex items-center gap-2">
            <select
              value={selectedSort}
              onChange={(e) => {
                setSelectedSort(e.target.value);
                handleApplyFilter(undefined, e.target.value);
              }}
              aria-label="Ordenar productos"
              className="px-3 py-2 rounded-xl glass-input text-xs bg-slate-900 border border-white/10 text-white cursor-pointer"
            >
              <option value="popular">Más Populares</option>
              <option value="newest">Más Recientes</option>
              <option value="price_asc">Menor Precio</option>
              <option value="price_desc">Mayor Precio</option>
              <option value="rating">Mejor Calificados</option>
            </select>
          </div>
        </div>

        {/* Categories Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <button
            onClick={() => {
              setSelectedCategory("");
              handleApplyFilter("");
            }}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap ${
              !selectedCategory
                ? "bg-cyan-500 text-slate-950 shadow-glow"
                : "bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800 border border-white/5"
            }`}
          >
            Todos los Productos
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedCategory(cat.slug);
                handleApplyFilter(cat.slug);
              }}
              className={`px-3.5 py-1.5 rounded-xl font-semibold transition-all whitespace-nowrap ${
                selectedCategory === cat.slug
                  ? "bg-cyan-500 text-slate-950 font-bold shadow-glow"
                  : "bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800 border border-white/5"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Product Grid */}
      {initialProducts.length === 0 ? (
        <div className="glass-panel rounded-3xl p-12 text-center border border-white/10 my-10">
          <ShoppingBag className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white mb-1">No se encontraron productos</h3>
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
              <div
                key={p.id}
                className="group glass-panel rounded-2xl overflow-hidden border border-white/10 hover:border-cyan-500/50 transition-all duration-300 flex flex-col hover:-translate-y-1 shadow-xl hover:shadow-glow"
              >
                {/* Product Cover Link */}
                <Link href={`/product/${p.slug}`} className="relative aspect-[16/9] w-full overflow-hidden bg-slate-950 block">
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
                      {p.affiliateCommissionPct}% Afiliados
                    </div>
                  )}
                  <div className="absolute bottom-3 right-3 bg-slate-950/90 text-[10px] text-emerald-400 font-semibold px-2 py-0.5 rounded-md border border-emerald-900/60 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    Garantía {p.guaranteeDays}d
                  </div>
                </Link>

                {/* Body Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <Link href={`/product/${p.slug}`}>
                      <h3 className="text-base font-heading font-bold text-white group-hover:text-cyan-400 transition-colors line-clamp-2 mb-1.5">
                        {p.title}
                      </h3>
                    </Link>
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {p.shortDescription || p.description}
                    </p>
                  </div>

                  <div className="space-y-3.5">
                    {/* Rating & Trust tag */}
                    <div className="flex items-center justify-between text-xs text-slate-400 pb-2.5 border-b border-white/5">
                      <div className="flex items-center gap-1 text-amber-400 font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <span>{p.ratingAvg.toFixed(1)}</span>
                        <span className="text-slate-500 font-normal">({p.reviewsCount})</span>
                      </div>
                      <span className="text-emerald-400 text-[11px] font-semibold flex items-center gap-1">
                        <Zap className="w-3 h-3 text-cyan-400" />
                        Entrega Inmediata
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

                    {/* Action Buttons: Más Info + Afiliarse */}
                    <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                      <Link
                        href={`/product/${p.slug}`}
                        className="btn-falcon-primary flex-1 justify-center text-xs py-2 px-3 font-bold flex items-center gap-1 shadow-glow"
                      >
                        <span>Más Info</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>

                      {p.affiliateEnabled && (
                        <button
                          type="button"
                          onClick={() => handleOpenAffiliateModal(p)}
                          className="btn-falcon-secondary text-xs py-2 px-3 justify-center text-purple-300 border-purple-500/40 hover:border-purple-400 hover:text-white flex items-center gap-1 font-bold whitespace-nowrap"
                          title="Obtener enlace de afiliado y ganar comisión"
                        >
                          <Percent className="w-3.5 h-3.5 text-purple-400" />
                          <span>Afiliarse ({p.affiliateCommissionPct}%)</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: AFILIARSE A UN PRODUCTO                            */}
      {/* ======================================================== */}
      {affiliateModalProduct && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-purple-500/30 rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2 text-purple-400">
                <Share2 className="w-5 h-5" />
                <h3 className="font-heading font-bold text-white text-base">
                  Afiliarse al Producto
                </h3>
              </div>
              <button
                onClick={() => setAffiliateModalProduct(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-white/10 flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-slate-900 overflow-hidden border border-white/10 shrink-0">
                <img
                  src={affiliateModalProduct.coverImageUrl}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-white truncate">
                  {affiliateModalProduct.title}
                </h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] font-bold text-purple-300 bg-purple-950 px-2 py-0.5 rounded-md border border-purple-800">
                    {affiliateModalProduct.affiliateCommissionPct}% Comisión
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Precio: {formatCurrency(convertCurrency(affiliateModalProduct.price, affiliateModalProduct.currencyCode, currency), currency)}
                  </span>
                </div>
              </div>
            </div>

            {!currentUser ? (
              <div className="bg-purple-950/30 border border-purple-500/30 rounded-2xl p-4 text-center space-y-3">
                <Lock className="w-6 h-6 text-purple-400 mx-auto" />
                <div className="space-y-1">
                  <strong className="text-xs text-white block">
                    Cuenta Requerida para Ganar Comisiones
                  </strong>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Para generar tu enlace único de afiliado y cobrar tus comisiones en tu billetera, debes tener una cuenta en FALKO.
                  </p>
                </div>
                <div className="flex flex-col gap-2 pt-2">
                  <Link
                    href={`/register?redirect=/marketplace`}
                    className="btn-falcon-primary text-xs py-2.5 justify-center shadow-glow font-bold flex items-center gap-1.5"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Crear Cuenta Gratis</span>
                  </Link>
                  <Link
                    href={`/login?redirect=/marketplace`}
                    className="btn-falcon-secondary text-xs py-2 justify-center"
                  >
                    Ya tengo cuenta, Iniciar Sesión
                  </Link>
                </div>
              </div>
            ) : affiliateLoading ? (
              <div className="py-6 text-center text-xs text-slate-400 space-y-2">
                <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
                <p>Generando tu enlace único de afiliado...</p>
              </div>
            ) : affiliateError ? (
              <div className="bg-rose-950/40 border border-rose-800 rounded-2xl p-4 text-center text-xs text-rose-300 space-y-2">
                <p>{affiliateError}</p>
                <Link href="/affiliate" className="btn-falcon-secondary text-xs py-1.5 px-3 inline-block">
                  Ir al Panel de Afiliados
                </Link>
              </div>
            ) : affiliateLinkResult ? (
              <div className="space-y-3 bg-slate-950/80 p-4 rounded-2xl border border-purple-500/40 shadow-glow">
                <span className="text-[11px] font-bold text-emerald-400 block flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" />
                  ¡Tu enlace de afiliado está listo!
                </span>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Comparte este enlace. Cada vez que alguien compre a través de él, recibirás automáticamente el{" "}
                  <strong className="text-white font-bold">{affiliateModalProduct.affiliateCommissionPct}%</strong> de comisión en tu billetera.
                </p>
                <div className="flex items-center gap-1.5 bg-slate-900 p-2 rounded-xl border border-white/10">
                  <input
                    readOnly
                    value={affiliateLinkResult}
                    className="bg-transparent text-[11px] text-slate-300 flex-1 outline-none truncate font-mono"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="btn-falcon-primary text-[10px] py-1 px-3 font-bold flex items-center gap-1"
                  >
                    {copiedAffiliate ? <Check className="w-3 h-3 text-black" /> : <Copy className="w-3 h-3 text-black" />}
                    <span>{copiedAffiliate ? "Copiado" : "Copiar"}</span>
                  </button>
                </div>
              </div>
            ) : null}

            <div className="pt-2 border-t border-white/5 flex justify-end">
              <button
                type="button"
                onClick={() => setAffiliateModalProduct(null)}
                className="btn-falcon-secondary text-xs py-2 px-4"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
