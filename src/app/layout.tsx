import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = {
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
    url: "https://falko.io",
    siteName: "FALKO",
    locale: "es_ES",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "FALKO — Marketplace de Productos Digitales",
    description: "El marketplace de escala global con ranking en USD y garantía protegida.",
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
      <body className="bg-[#070b14] text-slate-100 min-h-screen flex flex-col antialiased selection:bg-cyan-500 selection:text-black">
        <Navbar initialUser={currentUser} />
        <main className="flex-1 w-full">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
