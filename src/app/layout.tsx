import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { LiveSocialProof } from "@/components/social-proof/LiveSocialProof";
import { getCurrentUser } from "@/lib/auth";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#05070e",
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://falko.dpdns.org"),
  title: "FALKO — Marketplace Internacional de Productos Digitales",
  description:
    "El marketplace donde los productos digitales se convierten en oportunidades. Compra con garantía protegida, vende tus conocimientos o gana comisiones promocionando productos.",
  keywords: [
    "marketplace digital",
    "productos digitales",
    "afiliados",
    "cursos online",
    "prompts IA",
    "software boilerplates",
    "garantia protegida",
  ],
  openGraph: {
    title: "FALKO — Marketplace Internacional de Productos Digitales",
    description: "Compra, vende o promociona productos digitales de alto rendimiento con comisiones instantáneas y garantía protegida.",
    url: "https://falko.dpdns.org",
    siteName: "FALKO",
    locale: "es_ES",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "FALKO — Marketplace de Productos Digitales",
    description: "El marketplace de productos digitales de alta conversión con garantía protegida y comisiones inmediatas.",
  },
  verification: {
    google: "E32DKYJtKNNKi6pj3tlgSIaINJp42Kx1iQKzNlc4dbM",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let currentUser = null;
  try {
    currentUser = await getCurrentUser();
  } catch (err) {
    console.warn("RootLayout auth fallback:", err);
  }

  return (
    <html lang="es" className="dark scroll-smooth">
      <body className="bg-[#05070e] text-slate-100 min-h-screen flex flex-col antialiased selection:bg-cyan-500 selection:text-black">
        <Navbar initialUser={currentUser} />
        <main className="flex-1 w-full pb-20 md:pb-0">{children}</main>
        <LiveSocialProof />
        <MobileBottomNav initialUser={currentUser} />
        <Footer />
      </body>
    </html>
  );
}
