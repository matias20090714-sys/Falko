import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🦅 Seeding FALKO Marketplace Database (Clean Base)...");

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

  // 2. Seed Official Categories
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

  // 3. Seed Base Demo Users
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@falko.io" },
    create: {
      email: "admin@falko.io",
      passwordHash,
      firstName: "Admin",
      lastName: "Falko",
      countryCode: "UY",
      preferredCurrency: "USD",
      roles: {
        create: [{ role: "ADMIN" }, { role: "BUYER" }, { role: "SELLER" }],
      },
    },
    update: {},
  });

  const sellerUser = await prisma.user.upsert({
    where: { email: "seller@falko.io" },
    create: {
      email: "seller@falko.io",
      passwordHash,
      firstName: "Vendedor",
      lastName: "Demo",
      countryCode: "MX",
      preferredCurrency: "USD",
      roles: {
        create: [{ role: "SELLER" }, { role: "BUYER" }],
      },
    },
    update: {},
  });

  const affiliateUser = await prisma.user.upsert({
    where: { email: "affiliate@falko.io" },
    create: {
      email: "affiliate@falko.io",
      passwordHash,
      firstName: "Afiliado",
      lastName: "Demo",
      countryCode: "BR",
      preferredCurrency: "USD",
      roles: {
        create: [{ role: "AFFILIATE" }, { role: "BUYER" }],
      },
    },
    update: {},
  });

  const buyerUser = await prisma.user.upsert({
    where: { email: "buyer@falko.io" },
    create: {
      email: "buyer@falko.io",
      passwordHash,
      firstName: "Comprador",
      lastName: "Demo",
      countryCode: "UY",
      preferredCurrency: "UYU",
      roles: {
        create: [{ role: "BUYER" }],
      },
    },
    update: {},
  });

  // Create Affiliate Profile for Demo Affiliate
  await prisma.affiliateProfile.upsert({
    where: { userId: affiliateUser.id },
    create: {
      userId: affiliateUser.id,
      affiliateCode: "AFF-000001",
      bio: "Afiliado oficial de FALKO.",
    },
    update: {},
  });

  // 4. Create Empty Base Wallets
  await prisma.wallet.upsert({
    where: { userId: adminUser.id },
    create: {
      userId: adminUser.id,
      isPlatformOwner: true,
      availableBalance: 0.0,
      pendingBalance: 0.0,
      totalBalance: 0.0,
      currencyCode: "USD",
    },
    update: {},
  });

  await prisma.wallet.upsert({
    where: { userId: sellerUser.id },
    create: {
      userId: sellerUser.id,
      isPlatformOwner: false,
      availableBalance: 0.0,
      pendingBalance: 0.0,
      totalBalance: 0.0,
      currencyCode: "USD",
    },
    update: {},
  });

  await prisma.wallet.upsert({
    where: { userId: affiliateUser.id },
    create: {
      userId: affiliateUser.id,
      isPlatformOwner: false,
      availableBalance: 0.0,
      pendingBalance: 0.0,
      totalBalance: 0.0,
      currencyCode: "USD",
    },
    update: {},
  });

  await prisma.wallet.upsert({
    where: { userId: buyerUser.id },
    create: {
      userId: buyerUser.id,
      isPlatformOwner: false,
      availableBalance: 0.0,
      pendingBalance: 0.0,
      totalBalance: 0.0,
      currencyCode: "USD",
    },
    update: {},
  });

  // Clean any mock products or orders if they exist
  await prisma.review.deleteMany({});
  await prisma.orderItem.deleteMany({});
  await prisma.guaranteeHold.deleteMany({});
  await prisma.walletTransaction.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.affiliateProduct.deleteMany({});
  await prisma.productFile.deleteMany({});
  await prisma.productImage.deleteMany({});
  await prisma.favorite.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.rankingRecord.deleteMany({});

  console.log("✨ Clean base seed completed! Marketplace is empty and ready for real products.");
  console.log("   Demo accounts ready (password: falko123):");
  console.log("   - admin@falko.io");
  console.log("   - seller@falko.io");
  console.log("   - affiliate@falko.io");
  console.log("   - buyer@falko.io");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
