import React, { Suspense } from "react";
import { prisma } from "@/lib/db";
import { MarketplaceClient } from "./MarketplaceClient";

export const revalidate = 30;

export default async function MarketplacePage({
  searchParams,
}: {
  searchParams: { category?: string; search?: string; sort?: string };
}) {
  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
  });

  const products = await prisma.product.findMany({
    where: {
      status: "APPROVED",
      ...(searchParams.category
        ? {
            category: {
              slug: searchParams.category,
            },
          }
        : {}),
      ...(searchParams.search
        ? {
            OR: [
              { title: { contains: searchParams.search } },
              { description: { contains: searchParams.search } },
              { shortDescription: { contains: searchParams.search } },
            ],
          }
        : {}),
    },
    include: {
      category: true,
      seller: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          avatarUrl: true,
        },
      },
      reviews: {
        select: { rating: true },
      },
    },
    orderBy:
      searchParams.sort === "price-asc"
        ? { price: "asc" }
        : searchParams.sort === "price-desc"
        ? { price: "desc" }
        : searchParams.sort === "newest"
        ? { createdAt: "desc" }
        : { salesCount: "desc" },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-heading font-black text-white">
          Marketplace de Productos Digitales
        </h1>
        <p className="text-slate-400 text-sm mt-2">
          Descubre herramientas de software, agentes de IA, plantillas probadas y sistemas de negocio con garantía protegida.
        </p>
      </div>

      <Suspense fallback={<div className="text-slate-400 text-xs">Cargando catálogo...</div>}>
        <MarketplaceClient
          initialProducts={products}
          categories={categories}
          initialCategory={searchParams.category || ""}
          initialSearch={searchParams.search || ""}
          initialSort={searchParams.sort || "popular"}
        />
      </Suspense>
    </div>
  );
}
