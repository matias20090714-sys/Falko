import React from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { LibraryClient } from "./LibraryClient";

export const revalidate = 0; // Dynamic server-rendered

export default async function LibraryPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login?redirect=/library");
  }

  const orders = await prisma.order.findMany({
    where: {
      buyerId: user.id,
      status: "CONFIRMED",
    },
    orderBy: { createdAt: "desc" },
    include: {
      items: {
        include: {
          product: {
            include: {
              files: true,
              seller: {
                select: { firstName: true, lastName: true, avatarUrl: true },
              },
            },
          },
        },
      },
      reviews: true,
      refunds: true,
    },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-heading font-black text-white">
          Mi Biblioteca Digital
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Accede a todos tus productos digitales adquiridos, genera descargas privadas firmadas y gestiona tus garantías.
        </p>
      </div>

      <LibraryClient orders={orders} currentUser={user} />
    </div>
  );
}
