import React from "react";
import { getCurrentUser } from "@/lib/auth";
import { AcademyClient } from "./AcademyClient";
import { DashboardShell } from "@/components/layout/DashboardShell";

export const metadata = {
  title: "Academia de Creadores — Aprende a Vender en FALKO",
  description: "Guía paso a paso para crear, subir y vender productos digitales con éxito en FALKO.",
};

export default async function SellerAcademyPage() {
  const user = await getCurrentUser();
  return (
    <DashboardShell initialUser={user}>
      <AcademyClient />
    </DashboardShell>
  );
}
