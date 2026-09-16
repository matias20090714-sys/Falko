import React from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ProfileClient } from "./ProfileClient";

import { DashboardShell } from "@/components/layout/DashboardShell";

export const revalidate = 0;

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login?redirect=/profile");
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: {
      roles: true,
      affiliateProfile: true,
    },
  });

  if (!dbUser) {
    redirect("/login");
  }

  const initialUser = {
    id: dbUser.id,
    email: dbUser.email,
    firstName: dbUser.firstName,
    lastName: dbUser.lastName,
    avatarUrl: dbUser.avatarUrl,
    phone: dbUser.phone,
    bio: dbUser.bio,
    countryCode: dbUser.countryCode,
    preferredCurrency: dbUser.preferredCurrency,
    roles: dbUser.roles.map((r) => r.role),
    affiliateCode: dbUser.affiliateProfile?.affiliateCode,
    createdAt: dbUser.createdAt.toISOString(),
  };

  return (
    <DashboardShell initialUser={user}>
      <ProfileClient initialUser={initialUser} />
    </DashboardShell>
  );
}
