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
          seller: { select: { firstName: true, lastName: true, avatarUrl: true, isVerifiedSeller: true, countryCode: true, phone: true } },
          files: true,
          images: { orderBy: { sortOrder: "asc" } },
          modules: {
            include: { lessons: { orderBy: { sortOrder: "asc" } } },
            orderBy: { sortOrder: "asc" },
          },
          coupons: { where: { isActive: true } },
          reviews: {
            include: {
              buyer: { select: { firstName: true, lastName: true, avatarUrl: true } },
            },
            orderBy: { createdAt: "desc" },
          },
        },
      });
      return NextResponse.json({ product });
    }

    const products = await prisma.product.findMany({
      where: { status: "APPROVED" },
      include: {
        category: true,
        seller: { select: { firstName: true, lastName: true, avatarUrl: true, isVerifiedSeller: true } },
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
      compareAtPrice,
      currencyCode = "USD",
      pricingType = "ONE_TIME",
      billingInterval = "MONTHLY",
      trialDays = 0,
      productType = "DIGITAL",
      stock = 100,
      shippingFee = 0,
      estimatedDeliveryDays,
      categoryId,
      guaranteeDays = 7,
      storeTheme = "dark",
      primaryColor = "#06b6d4",
      secondaryColor = "#3b82f6",
      backgroundColor = "#030712",
      bannerImageUrl,
      customBadgeText,
      ctaButtonText,
      ctaSubtext,
      customHighlights,
      customFaqsJson,
      upsellTitle,
      upsellDescription,
      upsellPrice,
      upsellFileUrl,
      affiliateEnabled = true,
      affiliateCommissionPct = 20,
      affiliateApprovalMode = "AUTO",
      coverImageUrl,
      demoUrl,
      salesPageUrl,
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
      digitalFiles = [],
      images = [],
      modules = [],
      coupons = [],
    } = await req.json();

    const finalFiles = files.length > 0 ? files : digitalFiles;

    if (!title || !description || !price || !categoryId) {
      return NextResponse.json({ success: false, error: "Completa los campos obligatorios." }, { status: 400 });
    }

    const isPhysical = productType === "PHYSICAL";
    const validatedStock = isPhysical ? Math.max(0, parseInt(stock?.toString() || "0") || 0) : null;
    const validatedShippingFee = isPhysical ? Math.max(0, parseFloat(shippingFee?.toString() || "0") || 0) : 0;

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
        compareAtPrice: compareAtPrice ? parseFloat(compareAtPrice) : null,
        currencyCode,
        pricingType: pricingType || "ONE_TIME",
        billingInterval: pricingType === "SUBSCRIPTION" ? (billingInterval || "MONTHLY") : "MONTHLY",
        trialDays: parseInt(trialDays?.toString() || "0") || 0,
        productType: isPhysical ? "PHYSICAL" : "DIGITAL",
        stock: validatedStock,
        shippingFee: validatedShippingFee,
        estimatedDeliveryDays: isPhysical ? (estimatedDeliveryDays || "24-48 hs hábiles") : null,
        requiresShipping: isPhysical,
        categoryId,
        guaranteeDays: validatedGuarantee,
        storeTheme: storeTheme || "dark",
        primaryColor: primaryColor || "#06b6d4",
        secondaryColor: secondaryColor || "#3b82f6",
        backgroundColor: backgroundColor || "#030712",
        bannerImageUrl: bannerImageUrl || null,
        customBadgeText: customBadgeText || null,
        ctaButtonText: ctaButtonText || null,
        ctaSubtext: ctaSubtext || null,
        customHighlights: customHighlights ? (typeof customHighlights === "string" ? customHighlights : JSON.stringify(customHighlights)) : null,
        customFaqsJson: customFaqsJson ? (typeof customFaqsJson === "string" ? customFaqsJson : JSON.stringify(customFaqsJson)) : null,
        upsellTitle: upsellTitle || null,
        upsellDescription: upsellDescription || null,
        upsellPrice: upsellPrice ? parseFloat(upsellPrice) : null,
        upsellFileUrl: upsellFileUrl || null,
        affiliateEnabled: Boolean(affiliateEnabled),
        affiliateCommissionPct: validatedComm,
        affiliateApprovalMode,
        demoUrl: demoUrl || null,
        salesPageUrl: salesPageUrl || null,
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
            finalFiles.length > 0
              ? finalFiles.map((f: any) => ({
                  fileName: f.fileName || "recurso_digital.zip",
                  fileSizeBytes: f.fileSizeBytes || 10485760,
                  fileType: f.fileType || "application/zip",
                  storageKey: f.storageKey || `vault/${Date.now()}_${f.fileName || "recurso.zip"}`,
                }))
              : [],
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
          create: Array.from(
            new Set<string>(
              (coupons || [])
                .map((c: any) => String(c.code || "").toUpperCase().trim())
                .filter(Boolean)
            )
          ).map((code: string) => {
            const matching = coupons.find(
              (c: any) => String(c.code || "").toUpperCase().trim() === code
            );
            return {
              code,
              discountPct: parseFloat(matching?.discountPct) || 20,
              maxUses: parseInt(matching?.maxUses) || 500,
            };
          }),
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

export async function PUT(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "No autenticado." }, { status: 401 });
    }

    const body = await req.json();
    const {
      id,
      title,
      description,
      shortDescription,
      price,
      compareAtPrice,
      currencyCode = "USD",
      pricingType,
      billingInterval,
      trialDays,
      productType,
      stock,
      shippingFee,
      estimatedDeliveryDays,
      categoryId,
      guaranteeDays = 7,
      storeTheme,
      upsellTitle,
      upsellDescription,
      upsellPrice,
      upsellFileUrl,
      affiliateEnabled = true,
      affiliateCommissionPct = 20,
      affiliateApprovalMode = "AUTO",
      coverImageUrl,
      demoUrl,
      salesPageUrl,
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
      files,
      status,
    } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "ID de producto requerido." }, { status: 400 });
    }

    // Check ownership or ADMIN
    const existing = await prisma.product.findUnique({
      where: { id },
      include: { files: true },
    });

    if (!existing) {
      return NextResponse.json({ success: false, error: "Producto no encontrado." }, { status: 404 });
    }

    const isAdmin = Array.isArray(user.roles) && user.roles.includes("ADMIN");
    if (existing.sellerId !== user.id && !isAdmin) {
      return NextResponse.json({ success: false, error: "No tienes permiso para modificar este producto." }, { status: 403 });
    }

    const updateData: any = {};
    if (title) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (shortDescription !== undefined) updateData.shortDescription = shortDescription;
    if (price !== undefined && parseFloat(price) > 0) updateData.price = parseFloat(price);
    if (compareAtPrice !== undefined) updateData.compareAtPrice = compareAtPrice ? parseFloat(compareAtPrice) : null;
    if (pricingType !== undefined) updateData.pricingType = pricingType || "ONE_TIME";
    if (billingInterval !== undefined) updateData.billingInterval = billingInterval || "MONTHLY";
    if (trialDays !== undefined) updateData.trialDays = parseInt(trialDays?.toString() || "0") || 0;
    if (productType !== undefined) {
      const isPhysical = productType === "PHYSICAL";
      updateData.productType = isPhysical ? "PHYSICAL" : "DIGITAL";
      updateData.requiresShipping = isPhysical;
      if (stock !== undefined) updateData.stock = isPhysical ? Math.max(0, parseInt(stock?.toString() || "0") || 0) : null;
      if (shippingFee !== undefined) updateData.shippingFee = isPhysical ? Math.max(0, parseFloat(shippingFee?.toString() || "0") || 0) : 0;
      if (estimatedDeliveryDays !== undefined) updateData.estimatedDeliveryDays = isPhysical ? estimatedDeliveryDays : null;
    } else {
      if (stock !== undefined) updateData.stock = Math.max(0, parseInt(stock?.toString() || "0") || 0);
      if (shippingFee !== undefined) updateData.shippingFee = Math.max(0, parseFloat(shippingFee?.toString() || "0") || 0);
      if (estimatedDeliveryDays !== undefined) updateData.estimatedDeliveryDays = estimatedDeliveryDays;
    }
    if (storeTheme !== undefined) updateData.storeTheme = storeTheme || "dark";
    if (body.primaryColor !== undefined) updateData.primaryColor = body.primaryColor || "#06b6d4";
    if (body.secondaryColor !== undefined) updateData.secondaryColor = body.secondaryColor || "#3b82f6";
    if (body.backgroundColor !== undefined) updateData.backgroundColor = body.backgroundColor || "#030712";
    if (body.bannerImageUrl !== undefined) updateData.bannerImageUrl = body.bannerImageUrl || null;
    if (body.customBadgeText !== undefined) updateData.customBadgeText = body.customBadgeText || null;
    if (body.ctaButtonText !== undefined) updateData.ctaButtonText = body.ctaButtonText || null;
    if (body.ctaSubtext !== undefined) updateData.ctaSubtext = body.ctaSubtext || null;
    if (body.customHighlights !== undefined) {
      updateData.customHighlights = body.customHighlights ? (typeof body.customHighlights === "string" ? body.customHighlights : JSON.stringify(body.customHighlights)) : null;
    }
    if (body.customFaqsJson !== undefined) {
      updateData.customFaqsJson = body.customFaqsJson ? (typeof body.customFaqsJson === "string" ? body.customFaqsJson : JSON.stringify(body.customFaqsJson)) : null;
    }
    if (upsellTitle !== undefined) updateData.upsellTitle = upsellTitle || null;
    if (upsellDescription !== undefined) updateData.upsellDescription = upsellDescription || null;
    if (upsellPrice !== undefined) updateData.upsellPrice = upsellPrice ? parseFloat(upsellPrice) : null;
    if (upsellFileUrl !== undefined) updateData.upsellFileUrl = upsellFileUrl || null;
    if (currencyCode) updateData.currencyCode = currencyCode;
    if (categoryId) updateData.categoryId = categoryId;
    if (guaranteeDays !== undefined) updateData.guaranteeDays = Math.max(7, parseInt(guaranteeDays) || 7);
    if (affiliateEnabled !== undefined) updateData.affiliateEnabled = Boolean(affiliateEnabled);
    if (affiliateCommissionPct !== undefined) {
      updateData.affiliateCommissionPct = Math.min(90, Math.max(5, parseFloat(affiliateCommissionPct) || 20));
    }
    if (affiliateApprovalMode) updateData.affiliateApprovalMode = affiliateApprovalMode;
    if (coverImageUrl) updateData.coverImageUrl = coverImageUrl;
    if (demoUrl !== undefined) updateData.demoUrl = demoUrl || null;
    if (salesPageUrl !== undefined) updateData.salesPageUrl = salesPageUrl || null;
    if (videoUrl !== undefined) updateData.videoUrl = videoUrl || null;
    if (accessUrl !== undefined) updateData.accessUrl = accessUrl || null;
    if (accessInstructions !== undefined) updateData.accessInstructions = accessInstructions || null;
    if (orderBumpTitle !== undefined) updateData.orderBumpTitle = orderBumpTitle || null;
    if (orderBumpPrice !== undefined) updateData.orderBumpPrice = orderBumpPrice ? parseFloat(orderBumpPrice) : null;
    if (orderBumpDescription !== undefined) updateData.orderBumpDescription = orderBumpDescription || null;
    if (metaPixelId !== undefined) updateData.metaPixelId = metaPixelId || null;
    if (googleAnalyticsId !== undefined) updateData.googleAnalyticsId = googleAnalyticsId || null;
    if (tiktokPixelId !== undefined) updateData.tiktokPixelId = tiktokPixelId || null;
    if (affiliateSwipeUrl !== undefined) updateData.affiliateSwipeUrl = affiliateSwipeUrl || null;
    if (status) updateData.status = status;

    // Handle images update if provided
    if (Array.isArray(body.images)) {
      await prisma.productImage.deleteMany({
        where: { productId: id },
      });

      if (body.images.length > 0) {
        await prisma.productImage.createMany({
          data: body.images.map((img: any, idx: number) => ({
            productId: id,
            imageUrl: typeof img === "string" ? img : img.imageUrl,
            sortOrder: idx,
          })),
        });
      }
    }

    // Handle files update if provided
    if (Array.isArray(files)) {
      // Delete old files and replace with current files list
      await prisma.productFile.deleteMany({
        where: { productId: id },
      });

      if (files.length > 0) {
        await prisma.productFile.createMany({
          data: files.map((f: any) => ({
            productId: id,
            fileName: f.fileName || "recurso.zip",
            fileSizeBytes: f.fileSizeBytes || 1048576,
            fileType: f.fileType || "application/octet-stream",
            storageKey: f.storageKey || `vault/${Date.now()}_${f.fileName || "recurso.zip"}`,
          })),
        });
      }
    }

    const updated = await prisma.product.update({
      where: { id },
      data: updateData,
      include: {
        category: true,
        files: true,
        images: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Producto actualizado con éxito.",
      product: updated,
    });
  } catch (error: any) {
    console.error("Product update error:", error);
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

export async function DELETE(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "No autenticado." }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("id") || searchParams.get("productId");

    if (!productId) {
      return NextResponse.json({ success: false, error: "ID de producto requerido." }, { status: 400 });
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json({ success: false, error: "Producto no encontrado." }, { status: 404 });
    }

    const isAdmin = Array.isArray(user.roles) && user.roles.includes("ADMIN");
    if (product.sellerId !== user.id && !isAdmin) {
      return NextResponse.json(
        { success: false, error: "Solo el creador del producto puede eliminarlo." },
        { status: 403 }
      );
    }

    // Cascade delete related records in a single transaction
    await prisma.$transaction([
      prisma.review.deleteMany({ where: { productId } }),
      prisma.favorite.deleteMany({ where: { productId } }),
      prisma.affiliateProduct.deleteMany({ where: { productId } }),
      prisma.coupon.deleteMany({ where: { productId } }),
      prisma.productImage.deleteMany({ where: { productId } }),
      prisma.productFile.deleteMany({ where: { productId } }),
      prisma.productLesson.deleteMany({ where: { module: { productId } } }),
      prisma.productModule.deleteMany({ where: { productId } }),
      prisma.subscription.deleteMany({ where: { productId } }),
      prisma.orderItem.deleteMany({ where: { productId } }),
      prisma.product.delete({ where: { id: productId } }),
    ]);

    return NextResponse.json({
      success: true,
      message: "Producto eliminado permanentemente con éxito.",
    });
  } catch (error: any) {
    console.error("Delete product error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Error al eliminar producto." },
      { status: 500 }
    );
  }
}

