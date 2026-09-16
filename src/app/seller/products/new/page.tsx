import React from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NewProductClient } from "./NewProductClient";
import { DashboardShell } from "@/components/layout/DashboardShell";

export default async function NewProductPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login?redirect=/seller/products/new");
  }

  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
  });

  return (
    <DashboardShell initialUser={user}>
      <div className="max-w-6xl mx-auto space-y-6">
        <NewProductClient categories={categories} currentUser={user} />
      </div>
    </DashboardShell>
  );
}
