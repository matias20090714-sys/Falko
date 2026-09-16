import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const slug = req.nextUrl.searchParams.get("slug");
    if (slug) {
      const product = await prisma.product.findUnique({
        where: { slug },
        include: {
          category: true,
          seller: { select: { firstName: true, lastName: true, avatarUrl: true } },
          files: true,
          images: { orderBy: { sortOrder: "asc" } },
          modules: {
            include: { lessons: { orderBy: { sortOrder: "asc" } } },
            orderBy: { sortOrder: "asc" },
          },
          coupons: { where: { isActive: true } },
        },
      });
      return NextResponse.json({ product });
    }

    const products = await prisma.product.findMany({
      where: { status: "APPROVED" },
      include: {
        category: true,
        seller: { select: { firstName: true, lastName: true, avatarUrl: true } },
        images: true,
      },
      orderBy: { salesCount: "desc" },
    });

    return NextResponse.json({ products });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "No autenticado." }, { status: 401 });
    }

    const {
      title,
      description,
      shortDescription,
      price,
      currencyCode = "USD",
      categoryId,
      guaranteeDays = 7,
      affiliateEnabled = true,
      affiliateCommissionPct = 20,
      affiliateApprovalMode = "AUTO",
      coverImageUrl,
      demoUrl,
      videoUrl,
      accessUrl,
      accessInstructions,
      orderBumpTitle,
      orderBumpPrice,
      orderBumpDescription,
      metaPixelId,
      googleAnalyticsId,
      tiktokPixelId,
      affiliateSwipeUrl,
      files = [],
      images = [],
      modules = [],
      coupons = [],
    } = await req.json();

    if (!title || !description || !price || !categoryId) {
      return NextResponse.json({ success: false, error: "Completa los campos obligatorios." }, { status: 400 });
    }

    // Server-side validation: Guarantee minimum 7 days
    const validatedGuarantee = Math.max(7, parseInt(guaranteeDays) || 7);
    const validatedComm = Math.min(90, Math.max(5, parseFloat(affiliateCommissionPct) || 20));

    // Generate unique slug
    const baseSlug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    const slug = `${baseSlug}-${Date.now().toString().slice(-4)}`;

    // Ensure user has SELLER role
    await prisma.userRole.upsert({
      where: {
        userId_role: {
          userId: user.id,
          role: "SELLER",
        },
      },
      create: {
        userId: user.id,
        role: "SELLER",
      },
      update: {},
    });

    const product = await prisma.product.create({
      data: {
        slug,
        title,
        description,
        shortDescription,
        price: parseFloat(price),
        currencyCode,
        categoryId,
        guaranteeDays: validatedGuarantee,
        affiliateEnabled: Boolean(affiliateEnabled),
        affiliateCommissionPct: validatedComm,
        affiliateApprovalMode,
        demoUrl: demoUrl || null,
        videoUrl: videoUrl || null,
        accessUrl: accessUrl || null,
        accessInstructions: accessInstructions || null,
        orderBumpTitle: orderBumpTitle || null,
        orderBumpPrice: orderBumpPrice ? parseFloat(orderBumpPrice) : null,
        orderBumpDescription: orderBumpDescription || null,
        metaPixelId: metaPixelId || null,
        googleAnalyticsId: googleAnalyticsId || null,
        tiktokPixelId: tiktokPixelId || null,
        affiliateSwipeUrl: affiliateSwipeUrl || null,
        status: "APPROVED",
        coverImageUrl:
          coverImageUrl ||
          "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80",
        sellerId: user.id,
        files: {
          create:
            files.length > 0
              ? files.map((f: any) => ({
                  fileName: f.fileName || "recurso_digital.zip",
                  fileSizeBytes: f.fileSizeBytes || 10485760,
                  fileType: f.fileType || "application/zip",
                  storageKey: f.storageKey || `vault/${Date.now()}_${f.fileName || "recurso.zip"}`,
                }))
              : [
                  {
                    fileName: "paquete_recursos_completo.zip",
                    fileSizeBytes: 24500000,
                    fileType: "application/zip",
                    storageKey: `vault/${Date.now()}_paquete.zip`,
                  },
                ],
        },
        images: {
          create:
            images.length > 0
              ? images.map((img: any, idx: number) => ({
                  imageUrl: typeof img === "string" ? img : img.imageUrl,
                  sortOrder: idx,
                }))
              : [],
        },
        modules: {
          create: modules.map((m: any, mIdx: number) => ({
            title: m.title || `Módulo ${mIdx + 1}`,
            sortOrder: mIdx,
            lessons: {
              create: (m.lessons || []).map((l: any, lIdx: number) => ({
                title: l.title || `Lección ${lIdx + 1}`,
                description: l.description || null,
                videoUrl: l.videoUrl || null,
                fileUrl: l.fileUrl || null,
                fileName: l.fileName || null,
                durationMin: parseInt(l.durationMin) || 10,
                sortOrder: lIdx,
              })),
            },
          })),
        },
        coupons: {
          create: coupons.map((c: any) => ({
            code: (c.code || "PROMO").toUpperCase().trim(),
            discountPct: parseFloat(c.discountPct) || 20,
            maxUses: parseInt(c.maxUses) || 500,
          })),
        },
      },
      include: {
        files: true,
        images: true,
        modules: { include: { lessons: true } },
        coupons: true,
      },
    });

    return NextResponse.json({ success: true, product });
  } catch (error: any) {
    console.error("Product creation error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "No autenticado." }, { status: 401 });
    }

    const body = await req.json();
    const { productId, affiliateEnabled, affiliateCommissionPct, affiliateApprovalMode, price, status } = body;

    if (!productId) {
      return NextResponse.json({ success: false, error: "ID de producto requerido." }, { status: 400 });
    }

    // Verify ownership or ADMIN
    const existing = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!existing) {
      return NextResponse.json({ success: false, error: "Producto no encontrado." }, { status: 404 });
    }

    const isAdmin = Array.isArray(user.roles) && user.roles.includes("ADMIN");
    if (existing.sellerId !== user.id && !isAdmin) {
      return NextResponse.json({ success: false, error: "No tienes permiso para editar este producto." }, { status: 403 });
    }

    const updateData: any = {};
    if (typeof affiliateEnabled === "boolean") {
      updateData.affiliateEnabled = affiliateEnabled;
    }
    if (affiliateCommissionPct !== undefined) {
      updateData.affiliateCommissionPct = Math.min(90, Math.max(5, parseFloat(affiliateCommissionPct)));
    }
    if (affiliateApprovalMode && ["AUTO", "MANUAL"].includes(affiliateApprovalMode)) {
      updateData.affiliateApprovalMode = affiliateApprovalMode;
    }
    if (price !== undefined && parseFloat(price) > 0) {
      updateData.price = parseFloat(price);
    }
    if (status && ["APPROVED", "DRAFT", "ARCHIVED"].includes(status)) {
      updateData.status = status;
    }

    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      message: "Producto actualizado correctamente.",
      product: updatedProduct,
    });
  } catch (error: any) {
    console.error("Product patch error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

