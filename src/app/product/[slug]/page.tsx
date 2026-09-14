import React from "react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { ProductDetailClient } from "./ProductDetailClient";
import { Metadata } from "next";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const product = await prisma.product.findUnique({
    where: { slug: params.slug },
  });

  if (!product) {
    return { title: "Producto no encontrado — FALKO" };
  }

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

export default async function ProductDetailPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { ref?: string };
}) {
  const currentUser = await getCurrentUser();

  const product = await prisma.product.findUnique({
    where: { slug: params.slug },
    include: {
      category: true,
      files: true,
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

  if (!product || product.status !== "APPROVED") {
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

  return (
    <ProductDetailClient
      product={product}
      currentUser={currentUser}
      affiliateProductRecord={affiliateProductRecord}
      hasPurchased={hasPurchased}
      refCodeParam={searchParams.ref || ""}
    />
  );
}
