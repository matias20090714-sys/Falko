import React from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NewProductClient } from "./NewProductClient";

export default async function NewProductPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login?redirect=/seller/products/new");
  }

  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-heading font-black text-white">
          Publicar Nuevo Producto Digital
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Configura el precio, período de garantía (mínimo 7 días) y programa de afiliados.
        </p>
      </div>

      <NewProductClient categories={categories} currentUser={user} />
    </div>
  );
}
