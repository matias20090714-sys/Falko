import React from "react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { ProductDetailClient } from "./ProductDetailClient";
import { Metadata } from "next";

import { FALLBACK_PRODUCTS } from "@/lib/mock-data";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  try {
    const product = await prisma.product.findUnique({
      where: { slug: params.slug },
    });

    if (product) {
      return {
        title: `${product.title} — FALKO`,
        description: product.shortDescription || product.description.substring(0, 150),
        openGraph: {
          title: product.title,
          description: product.shortDescription || product.description.substring(0, 150),
          images: [product.coverImageUrl],
        },
      };
    }
  } catch (err) {
    console.warn("Metadata DB lookup fallback:", err);
  }

  const fallback = FALLBACK_PRODUCTS.find((p) => p.slug === params.slug);
  if (fallback) {
    return {
      title: `${fallback.title} — FALKO`,
      description: fallback.shortDescription || fallback.description,
      openGraph: {
        title: fallback.title,
        description: fallback.shortDescription || fallback.description,
        images: [fallback.coverImageUrl],
      },
    };
  }

  return { title: "Producto no encontrado — FALKO" };
}

export default async function ProductDetailPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { ref?: string };
}) {
  const currentUser = await getCurrentUser();

  let product: any = null;

  try {
    product = await prisma.product.findUnique({
      where: { slug: params.slug },
      include: {
        category: true,
        files: true,
        images: { orderBy: { sortOrder: "asc" } },
        seller: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
            countryCode: true,
            createdAt: true,
          },
        },
        reviews: {
          where: { isModerated: false },
          orderBy: { createdAt: "desc" },
          include: {
            buyer: {
              select: {
                firstName: true,
                lastName: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
    });
  } catch (err) {
    console.warn("ProductDetailPage DB query fallback:", err);
  }

  if (!product) {
    const fallback = FALLBACK_PRODUCTS.find((p) => p.slug === params.slug);
    if (fallback) {
      product = {
        ...fallback,
        status: "APPROVED",
        files: [],
        reviews: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }
  }

  if (!product) {
    notFound();
  }

  // Check if current user has an affiliate link / application for this product
  let affiliateProductRecord = null;
  if (currentUser) {
    const affiliateProfile = await prisma.affiliateProfile.findUnique({
      where: { userId: currentUser.id },
    });

    if (affiliateProfile) {
      affiliateProductRecord = await prisma.affiliateProduct.findUnique({
        where: {
          affiliateProfileId_productId: {
            affiliateProfileId: affiliateProfile.id,
            productId: product.id,
          },
        },
      });
    }
  }

  // Check if current user already owns this product
  let hasPurchased = false;
  if (currentUser) {
    const existingOrder = await prisma.order.findFirst({
      where: {
        buyerId: currentUser.id,
        status: "CONFIRMED",
        items: {
          some: { productId: product.id },
        },
      },
    });
    hasPurchased = !!existingOrder;
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.shortDescription || product.description.substring(0, 200),
    image: [product.coverImageUrl],
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: product.currencyCode || "USD",
      availability: "https://schema.org/InStock",
      url: `${process.env.NEXT_PUBLIC_APP_URL || "https://falko.dpdns.org"}/product/${product.slug}`,
      seller: {
        "@type": "Person",
        name: `${product.seller?.firstName || "Creador"} ${product.seller?.lastName || "Verificado"}`,
      },
    },
    ...(product.ratingAvg && product.ratingAvg > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: product.ratingAvg.toFixed(1),
            reviewCount: Math.max(1, product.reviewsCount || 1),
            bestRating: "5",
            worstRating: "1",
          },
        }
      : {}),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductDetailClient
        product={product}
        currentUser={currentUser}
        affiliateProductRecord={affiliateProductRecord}
        hasPurchased={hasPurchased}
        refCodeParam={searchParams.ref || ""}
      />
    </>
  );
}
