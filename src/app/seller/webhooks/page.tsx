import React from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { WebhooksClient } from "./WebhooksClient";
import { DashboardShell } from "@/components/layout/DashboardShell";

export const revalidate = 0;

export default async function SellerWebhooksPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login?redirect=/seller/webhooks");
  }

  // Ensure seller role
  if (!user.roles.includes("SELLER")) {
    await prisma.userRole.upsert({
      where: { userId_role: { userId: user.id, role: "SELLER" } },
      create: { userId: user.id, role: "SELLER" },
      update: {},
    });
  }

  const webhooks = await prisma.webhookEndpoint.findMany({
    where: { userId: user.id },
    include: {
      deliveries: {
        orderBy: { createdAt: "desc" },
        take: 5,
      },
      _count: {
        select: { deliveries: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const products = await prisma.product.findMany({
    where: { sellerId: user.id },
    select: { id: true, title: true, slug: true },
  });

  // Serialize dates for client
  const serializedWebhooks = webhooks.map((w) => ({
    ...w,
    createdAt: w.createdAt.toISOString(),
    deliveries: w.deliveries.map((d) => ({
      ...d,
      createdAt: d.createdAt.toISOString(),
    })),
  }));

  return (
    <DashboardShell initialUser={user}>
      <WebhooksClient initialWebhooks={serializedWebhooks as any} products={products} />
    </DashboardShell>
  );
}
