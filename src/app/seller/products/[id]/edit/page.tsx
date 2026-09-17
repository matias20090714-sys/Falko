import React from "react";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { EditProductClient } from "./EditProductClient";

export const dynamic = "force-dynamic";

export default async function EditProductPage({
  params,
}: {
  params: { id: string };
}) {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    redirect(`/login?redirect=/seller/products/${params.id}/edit`);
  }

  const [product, categories] = await Promise.all([
    prisma.product.findUnique({
      where: { id: params.id },
      include: {
        category: true,
        files: true,
        images: { orderBy: { sortOrder: "asc" } },
      },
    }),
    prisma.category.findMany({
      orderBy: { name: "asc" },
    }),
  ]);

  if (!product) {
    notFound();
  }

  const isAdmin = Array.isArray(currentUser.roles) && currentUser.roles.includes("ADMIN");
  if (product.sellerId !== currentUser.id && !isAdmin) {
    redirect("/seller");
  }

  return (
    <div className="min-h-screen bg-[#05070e] text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <EditProductClient
        initialProduct={product}
        categories={categories}
        currentUser={currentUser}
      />
    </div>
  );
}
