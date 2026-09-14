import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🦅 Seeding FALKO Marketplace Database...");

  const passwordHash = await bcrypt.hash("falko123", 10);

  // 1. Seed Platform Settings
  await prisma.platformSettings.upsert({
    where: { key: "platform_commission_uyu" },
    create: { key: "platform_commission_uyu", value: "25", description: "Comisión fija FALKO por venta en UYU" },
    update: { value: "25" },
  });
  await prisma.platformSettings.upsert({
    where: { key: "minimum_withdrawal_usd" },
    create: { key: "minimum_withdrawal_usd", value: "20", description: "Monto mínimo para retiro en USD" },
    update: { value: "20" },
  });
  await prisma.platformSettings.upsert({
    where: { key: "default_guarantee_days" },
    create: { key: "default_guarantee_days", value: "7", description: "Días de garantía por defecto" },
    update: { value: "7" },
  });

  // 2. Seed Categories
  const categories = [
    { slug: "inteligencia-artificial", name: "Inteligencia Artificial", icon: "Bot", description: "Prompts, agentes autónomos, modelos y flujos de automatización con IA." },
    { slug: "negocios", name: "Negocios & SaaS", icon: "Briefcase", description: "Modelos de negocio, playbooks operativos y plantillas financieras." },
    { slug: "marketing", name: "Marketing Digital", icon: "Megaphone", description: "Embudos de venta, copys de alta conversión y estrategias de adquisición." },
    { slug: "ecommerce", name: "Ecommerce & Dropshipping", icon: "ShoppingBag", description: "Listas de proveedores verificados, tiendas pre-construidas y automatización." },
    { slug: "afiliados", name: "Marketing de Afiliados", icon: "Share2", description: "Guías maestras, creativos publicitarios y sistemas de tráfico pagado/orgánico." },
    { slug: "diseno", name: "Diseño & UI/UX", icon: "Palette", description: "Sistemas de diseño Figma, kits de componentes y paquetes de ilustración 3D." },
    { slug: "programacion", name: "Programación & Dev Tools", icon: "Code", description: "Boilerplates full-stack, APIs listas y componentes listos para producción." },
    { slug: "finanzas", name: "Finanzas & Cripto", icon: "TrendingUp", description: "Gestores de portafolio, bots de análisis algorítmico y educación bursátil." },
    { slug: "productividad", name: "Productividad & Notion", icon: "CheckSquare", description: "Sistemas de gestión de vida y negocios en Notion y Obsidian." },
    { slug: "educacion", name: "Educación & Cursos", icon: "GraduationCap", description: "Cursos intensivos, másters digitales y certificados prácticos." },
    { slug: "otros", name: "Otros Recursos Digitales", icon: "Folder", description: "Audio, presets, tipografías y recursos creativos diversos." },
  ];

  for (let i = 0; i < categories.length; i++) {
    await prisma.category.upsert({
      where: { slug: categories[i].slug },
      create: { ...categories[i], sortOrder: i },
      update: { name: categories[i].name, icon: categories[i].icon, description: categories[i].description },
    });
  }

  // 3. Seed Users
  // Admin / Platform Treasury Owner
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@falko.io" },
    create: {
      email: "admin@falko.io",
      passwordHash,
      firstName: "Ignacio",
      lastName: "Falcon (Admin)",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
      countryCode: "UY",
      preferredCurrency: "USD",
      roles: {
        create: [{ role: "ADMIN" }, { role: "BUYER" }, { role: "SELLER" }],
      },
    },
    update: {},
  });

  // Top Seller: Carlos Mendez
  const sellerUser = await prisma.user.upsert({
    where: { email: "seller@falko.io" },
    create: {
      email: "seller@falko.io",
      passwordHash,
      firstName: "Carlos",
      lastName: "Méndez",
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
      countryCode: "MX",
      preferredCurrency: "USD",
      roles: {
        create: [{ role: "SELLER" }, { role: "BUYER" }],
      },
    },
    update: {},
  });

  // Top Affiliate: Valentina Rios (Code AFF-000001)
  const affiliateUser = await prisma.user.upsert({
    where: { email: "affiliate@falko.io" },
    create: {
      email: "affiliate@falko.io",
      passwordHash,
      firstName: "Valentina",
      lastName: "Ríos",
      avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80",
      countryCode: "BR",
      preferredCurrency: "USD",
      roles: {
        create: [{ role: "AFFILIATE" }, { role: "BUYER" }],
      },
    },
    update: {},
  });

  // Buyer: Mateo Silva
  const buyerUser = await prisma.user.upsert({
    where: { email: "buyer@falko.io" },
    create: {
      email: "buyer@falko.io",
      passwordHash,
      firstName: "Mateo",
      lastName: "Silva",
      avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80",
      countryCode: "UY",
      preferredCurrency: "UYU",
      roles: {
        create: [{ role: "BUYER" }],
      },
    },
    update: {},
  });

  // Create Affiliate Profile for Valentina
  const affiliateProfile = await prisma.affiliateProfile.upsert({
    where: { userId: affiliateUser.id },
    create: {
      userId: affiliateUser.id,
      affiliateCode: "AFF-000001",
      bio: "Especialista en tráfico de alta conversión para productos de IA y negocios digitales.",
    },
    update: {},
  });

  // 4. Create Wallets
  // Owner Wallet
  await prisma.wallet.upsert({
    where: { userId: adminUser.id },
    create: {
      userId: adminUser.id,
      isPlatformOwner: true,
      availableBalance: 1250.0,
      pendingBalance: 320.0,
      totalBalance: 1570.0,
      currencyCode: "USD",
    },
    update: {},
  });

  // Seller Wallet
  const sellerWallet = await prisma.wallet.upsert({
    where: { userId: sellerUser.id },
    create: {
      userId: sellerUser.id,
      isPlatformOwner: false,
      availableBalance: 4850.0,
      pendingBalance: 1200.0,
      withdrawnBalance: 8500.0,
      totalBalance: 6050.0,
      currencyCode: "USD",
    },
    update: {},
  });

  // Affiliate Wallet
  const affiliateWallet = await prisma.wallet.upsert({
    where: { userId: affiliateUser.id },
    create: {
      userId: affiliateUser.id,
      isPlatformOwner: false,
      availableBalance: 2340.0,
      pendingBalance: 680.0,
      withdrawnBalance: 5100.0,
      totalBalance: 3020.0,
      currencyCode: "USD",
    },
    update: {},
  });

  // 5. Seed High-Converting Realistic Products
  const catAI = await prisma.category.findUnique({ where: { slug: "inteligencia-artificial" } });
  const catBiz = await prisma.category.findUnique({ where: { slug: "negocios" } });
  const catMkt = await prisma.category.findUnique({ where: { slug: "marketing" } });
  const catDev = await prisma.category.findUnique({ where: { slug: "programacion" } });
  const catDes = await prisma.category.findUnique({ where: { slug: "diseno" } });

  const productsData = [
    {
      slug: "ai-agency-os-mastery",
      title: "AI Agency OS — El Sistema Completo para Escalar tu Agencia de Inteligencia Artificial",
      shortDescription: "Agentes autónomos, workflows en Make/n8n, contratos legales y 50+ prompts para cerrar clientes de $3k/mes.",
      description: `### Domina la era de las agencias de Inteligencia Artificial

AI Agency OS es la arquitectura definitiva para desarrolladores, consultores y emprendedores que desean lanzar y escalar servicios de automatización con agentes de IA.

#### ¿Qué incluye este paquete completo?
- **50+ Agentes Autónomos** listos para producción (Customer Support, Lead Qualifier, Data Enrichment).
- **Workflows exportables** en JSON para Make, n8n y LangChain.
- **Templates de Propuestas Comerciales** y contratos de retención mensual validados en EE.UU. y Latinoamérica.
- **Garantía incondicional** respaldada por FALKO por 14 días.
- Acceso a actualizaciones continuas y canal privado de soporte.`,
      price: 97.0,
      currencyCode: "USD",
      coverImageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80",
      guaranteeDays: 14,
      affiliateEnabled: true,
      affiliateCommissionPct: 40.0, // 40%
      affiliateApprovalMode: "AUTO",
      status: "APPROVED",
      salesCount: 142,
      ratingAvg: 4.9,
      reviewsCount: 38,
      isFeatured: true,
      categoryId: catAI?.id || "",
      sellerId: sellerUser.id,
      files: [
        { fileName: "AI_Agency_OS_MasterKit_2026.zip", fileSizeBytes: 48500000, fileType: "application/zip", storageKey: "vault/ai-agency-os-v2.zip" },
        { fileName: "Guia_Instalacion_Agentes.pdf", fileSizeBytes: 3200000, fileType: "application/pdf", storageKey: "vault/guia-instalacion.pdf" },
      ],
    },
    {
      slug: "saas-launch-boilerplate-nextjs",
      title: "SaaS Launch Rocket — Boilerplate Next.js 15, Auth, Multi-Tenant & Stripe/PayPal",
      shortDescription: "Ahorra 180 horas de código. Arquitectura lista para producción con PostgreSQL, Prisma y Tailwind CSS.",
      description: `### Lanza tu Micro-SaaS en 48 horas en lugar de meses

El boilerplate definitivo para desarrolladores independientes que quieren facturar rápido. Con autenticación segura, base de datos relacional, pasarelas globales y diseño hiper-optimizado.`,
      price: 149.0,
      currencyCode: "USD",
      coverImageUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80",
      guaranteeDays: 7,
      affiliateEnabled: true,
      affiliateCommissionPct: 30.0,
      affiliateApprovalMode: "AUTO",
      status: "APPROVED",
      salesCount: 98,
      ratingAvg: 4.8,
      reviewsCount: 24,
      isFeatured: true,
      categoryId: catDev?.id || "",
      sellerId: sellerUser.id,
      files: [
        { fileName: "saas-launch-rocket-source.zip", fileSizeBytes: 65000000, fileType: "application/zip", storageKey: "vault/saas-rocket.zip" },
      ],
    },
    {
      slug: "master-embudos-high-ticket",
      title: "Embudos High-Ticket & VSL Mastery — Cierra Ventas de $1,000 a $5,000 USD",
      shortDescription: "Estructuras de guiones persuasivos, páginas de aterrizaje en Figma/HTML y automatización de llamadas con Cal.com.",
      description: `### Convierte desconocidos en clientes de alto valor sin llamadas incómodas.
Metodología paso a paso para estructurar ofertas irresistibles, crear cartas de venta en video (VSL) de 12 minutos y llenar tu agenda con prospectos calificados.`,
      price: 79.0,
      currencyCode: "USD",
      coverImageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80",
      guaranteeDays: 30,
      affiliateEnabled: true,
      affiliateCommissionPct: 50.0, // 50%
      affiliateApprovalMode: "MANUAL",
      status: "APPROVED",
      salesCount: 310,
      ratingAvg: 5.0,
      reviewsCount: 76,
      isFeatured: true,
      categoryId: catMkt?.id || "",
      sellerId: sellerUser.id,
      files: [
        { fileName: "Embudos_HighTicket_Playbook.pdf", fileSizeBytes: 18000000, fileType: "application/pdf", storageKey: "vault/embudos-playbook.pdf" },
      ],
    },
    {
      slug: "design-system-figma-pro",
      title: "Falcon UI Kit & Design System — 1,200+ Componentes Accesibles en Figma",
      shortDescription: "Sistema de diseño nivel Silicon Valley con variables, tokens oscuros/claros y prototipado interactivo.",
      description: `Construye interfaces de software de nivel internacional en minutos con componentes testeados en accesibilidad WCAG y micro-animaciones modernas.`,
      price: 59.0,
      currencyCode: "USD",
      coverImageUrl: "https://images.unsplash.com/photo-1581291518655-9523c932deb4?w=800&auto=format&fit=crop&q=80",
      guaranteeDays: 7,
      affiliateEnabled: true,
      affiliateCommissionPct: 35.0,
      affiliateApprovalMode: "AUTO",
      status: "APPROVED",
      salesCount: 220,
      ratingAvg: 4.9,
      reviewsCount: 45,
      isFeatured: false,
      categoryId: catDes?.id || "",
      sellerId: sellerUser.id,
      files: [
        { fileName: "Falcon_Design_System_2026.fig", fileSizeBytes: 42000000, fileType: "application/octet-stream", storageKey: "vault/falcon-ds.fig" },
      ],
    },
    {
      slug: "negocios-digitales-prompt-bundle",
      title: "Prompt Engineering Playbook — 1,000 Prompts Validados para Negocios y Finanzas",
      shortDescription: "Domina ChatGPT, Claude y Midjourney para automatizar análisis de mercado, copy y código.",
      description: `El compendio definitivo de prompts estructurados bajo ingeniería inversa para maximizar el output de los mejores modelos de lenguaje.`,
      price: 29.0,
      currencyCode: "USD",
      coverImageUrl: "https://images.unsplash.com/photo-1677442136019-21780efad99a?w=800&auto=format&fit=crop&q=80",
      guaranteeDays: 7,
      affiliateEnabled: true,
      affiliateCommissionPct: 50.0,
      affiliateApprovalMode: "AUTO",
      status: "APPROVED",
      salesCount: 520,
      ratingAvg: 4.7,
      reviewsCount: 110,
      isFeatured: false,
      categoryId: catAI?.id || "",
      sellerId: sellerUser.id,
      files: [
        { fileName: "Prompt_Engineering_Master_Kit.pdf", fileSizeBytes: 12000000, fileType: "application/pdf", storageKey: "vault/prompts-kit.pdf" },
      ],
    },
  ];

  for (const p of productsData) {
    const { files, ...productData } = p;
    const createdProduct = await prisma.product.upsert({
      where: { slug: productData.slug },
      create: {
        ...productData,
        files: {
          create: files,
        },
      },
      update: {
        ...productData,
      },
    });

    // Create affiliate product links for Valentina
    await prisma.affiliateProduct.upsert({
      where: {
        affiliateProfileId_productId: {
          affiliateProfileId: affiliateProfile.id,
          productId: createdProduct.id,
        },
      },
      create: {
        affiliateProfileId: affiliateProfile.id,
        productId: createdProduct.id,
        status: "APPROVED",
        uniqueRefCode: `${affiliateProfile.affiliateCode}_${createdProduct.slug.substring(0, 10)}`,
        clicksCount: 342,
        conversionsCount: 48,
      },
      update: {},
    });
  }

  // 6. Seed Global Ranking Records
  // Top sellers and affiliates with realistic volume
  const rankingEntries = [
    { userId: sellerUser.id, volumeUsd: 124500.0, tier: "GOLD" }, // $124,500
    { userId: affiliateUser.id, volumeUsd: 68900.0, tier: "SILVER" }, // $68,900
    { userId: adminUser.id, volumeUsd: 28400.0, tier: "SILVER" },
    { userId: buyerUser.id, volumeUsd: 850.0, tier: "NOVICE" },
  ];

  for (const entry of rankingEntries) {
    await prisma.rankingRecord.upsert({
      where: {
        userId_period_periodKey: {
          userId: entry.userId,
          period: "ALL_TIME",
          periodKey: "ALL",
        },
      },
      create: {
        userId: entry.userId,
        period: "ALL_TIME",
        periodKey: "ALL",
        salesVolumeUsd: entry.volumeUsd,
        currentTier: entry.tier,
      },
      update: {
        salesVolumeUsd: entry.volumeUsd,
        currentTier: entry.tier,
      },
    });
  }

  // 7. Seed Sample Verified Purchase for Buyer Mateo
  const sampleProduct = await prisma.product.findFirst({ where: { slug: "ai-agency-os-mastery" } });
  if (sampleProduct) {
    const existingOrder = await prisma.order.findFirst({
      where: { buyerId: buyerUser.id, items: { some: { productId: sampleProduct.id } } },
    });

    if (!existingOrder) {
      const orderDate = new Date();
      const releaseDate = new Date();
      releaseDate.setDate(releaseDate.getDate() + sampleProduct.guaranteeDays);

      const createdOrder = await prisma.order.create({
        data: {
          orderNumber: `ORD-FLK-${Date.now().toString().slice(-6)}`,
          buyerId: buyerUser.id,
          totalAmount: sampleProduct.price,
          currencyCode: sampleProduct.currencyCode,
          basePrice: sampleProduct.price,
          exchangeRate: 1.0,
          platformFeeUyu: 25.0,
          platformFeeConverted: 0.63,
          affiliateCommissionAmount: 38.8,
          sellerEarningAmount: 57.57,
          guaranteeDays: sampleProduct.guaranteeDays,
          guaranteeReleaseDate: releaseDate,
          status: "CONFIRMED",
          paymentProvider: "MOCK",
          items: {
            create: {
              productId: sampleProduct.id,
              price: sampleProduct.price,
              currencyCode: sampleProduct.currencyCode,
            },
          },
          reviews: {
            create: {
              productId: sampleProduct.id,
              buyerId: buyerUser.id,
              rating: 5,
              title: "¡Increíblemente completo y práctico!",
              comment: "Los workflows de Make y los prompts para prospección me permitieron cerrar mi primer cliente de IA en solo 5 días. 100% recomendado.",
              sellerReply: "¡Muchísimas gracias Mateo por tu confianza! A seguir volando alto 🦅",
            },
          },
        },
      });

      console.log(`Created sample verified purchase: ${createdOrder.orderNumber}`);
    }
  }

  console.log("✨ Seed completed successfully! Demo accounts ready:");
  console.log("   Admin:     admin@falko.io     (pass: falko123)");
  console.log("   Seller:    seller@falko.io    (pass: falko123)");
  console.log("   Affiliate: affiliate@falko.io (pass: falko123)");
  console.log("   Buyer:     buyer@falko.io     (pass: falko123)");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
