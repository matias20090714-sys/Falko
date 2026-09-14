import React from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { SellerAffiliatesClient } from "./SellerAffiliatesClient";

export const revalidate = 0;

export default async function SellerAffiliatesPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login?redirect=/seller/affiliates");
  }

  const requests = await prisma.affiliateProduct.findMany({
    where: {
      product: { sellerId: user.id },
    },
    include: {
      product: true,
      affiliateProfile: {
        include: {
          user: {
            select: { firstName: true, lastName: true, email: true, avatarUrl: true, countryCode: true },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-heading font-black text-white">
          Gestión de Solicitudes de Afiliados
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Modera las solicitudes de promotores para productos configurados con aprobación manual.
        </p>
      </div>

      <SellerAffiliatesClient initialRequests={requests} />
    </div>
  );
}
