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
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "FALKO Marketplace",
      },
    ],
    locale: "es_ES",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "FALKO — Marketplace de Productos Digitales",
    description: "El marketplace de productos digitales de alta conversión con garantía protegida y comisiones inmediatas.",
    images: ["/og-image.png"],
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "FALKO",
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
      { url: "/apple-touch-icon-precomposed.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/apple-touch-icon.png",
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
      <head>
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="apple-touch-icon-precomposed" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/icon-192.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/icon-512.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="FALKO" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="application-name" content="FALKO" />
      </head>
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
