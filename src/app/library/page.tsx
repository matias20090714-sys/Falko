import React from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { LibraryClient } from "./LibraryClient";
import { DashboardShell } from "@/components/layout/DashboardShell";

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
    <DashboardShell initialUser={user}>
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-heading font-black text-white">
            Mi Biblioteca Digital
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Accede a todos tus productos digitales adquiridos, genera descargas privadas firmadas y gestiona tus garantías.
          </p>
        </div>

        <LibraryClient orders={orders} currentUser={user} />
      </div>
    </DashboardShell>
  );
}
