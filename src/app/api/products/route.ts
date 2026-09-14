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
        },
      });
      return NextResponse.json({ product });
    }

    const products = await prisma.product.findMany({
      where: { status: "APPROVED" },
      include: {
        category: true,
        seller: { select: { firstName: true, lastName: true, avatarUrl: true } },
      },
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
      files = [],
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
        status: "APPROVED", // Auto-approved on creation per requirement 10, with ADMIN moderation available
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
                  storageKey: `vault/${Date.now()}_${f.fileName || "recurso.zip"}`,
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
      },
      include: {
        files: true,
      },
    });

    return NextResponse.json({ success: true, product });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
