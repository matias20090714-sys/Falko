import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🦅 Initializing FALKO Official Admin Account & Clean Database...");

  const adminEmail = "matias20090714@gmail.com";
  const adminPasswordHash = await bcrypt.hash("PMXL200907", 10);

  // 1. Seed Platform Settings (25 UYU Base Commission)
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

  // 3. Remove any old mock accounts if they exist
  await prisma.user.deleteMany({
    where: {
      email: {
        in: ["admin@falko.io", "seller@falko.io", "affiliate@falko.io", "buyer@falko.io", "owner@falko.io"],
      },
    },
  });

  // 4. Create / Upsert Matías Official Admin Account
  const matiasAdmin = await prisma.user.upsert({
    where: { email: adminEmail },
    create: {
      email: adminEmail,
      passwordHash: adminPasswordHash,
      firstName: "Matías",
      lastName: "Administrador",
      countryCode: "UY",
      preferredCurrency: "UYU",
      roles: {
        create: [
          { role: "ADMIN" },
          { role: "SELLER" },
          { role: "AFFILIATE" },
          { role: "BUYER" },
        ],
      },
    },
    update: {
      passwordHash: adminPasswordHash,
      firstName: "Matías",
      lastName: "Administrador",
      countryCode: "UY",
      preferredCurrency: "UYU",
    },
  });

  // Ensure all 4 roles are active for Matías
  const roles = ["ADMIN", "SELLER", "AFFILIATE", "BUYER"];
  for (const role of roles) {
    await prisma.userRole.upsert({
      where: {
        userId_role: {
          userId: matiasAdmin.id,
          role,
        },
      },
      create: {
        userId: matiasAdmin.id,
        role,
      },
      update: {},
    });
  }

  // Ensure Affiliate profile exists for Matías
  await prisma.affiliateProfile.upsert({
    where: { userId: matiasAdmin.id },
    create: {
      userId: matiasAdmin.id,
      affiliateCode: "FALKO-CEO",
      bio: "Fundador y Administrador Oficial de FALKO.",
    },
    update: {},
  });

  // 5. Unset any other platform owner wallets and set Matías as the ONLY Platform Owner Wallet
  await prisma.wallet.updateMany({
    where: {
      userId: { not: matiasAdmin.id },
      isPlatformOwner: true,
    },
    data: { isPlatformOwner: false },
  });

  await prisma.wallet.upsert({
    where: { userId: matiasAdmin.id },
    create: {
      userId: matiasAdmin.id,
      isPlatformOwner: true,
      availableBalance: 0.0,
      pendingBalance: 0.0,
      totalBalance: 0.0,
      currencyCode: "UYU",
    },
    update: {
      isPlatformOwner: true,
    },
  });

  console.log("✨ Matías Official Admin Account & Platform Owner Wallet created successfully!");
  console.log(`   Email:    ${adminEmail}`);
  console.log(`   Password: [Configured as requested]`);
  console.log(`   Wallet:   isPlatformOwner = true (Receiving all 25 UYU platform commissions)`);
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
