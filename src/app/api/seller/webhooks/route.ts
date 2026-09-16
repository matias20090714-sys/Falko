import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import crypto from "crypto";

export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ success: false, error: "No autorizado." }, { status: 401 });
    }

    const webhooks = await prisma.webhookEndpoint.findMany({
      where: { userId: currentUser.id },
      include: {
        deliveries: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        _count: {
          select: { deliveries: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const products = await prisma.product.findMany({
      where: { sellerId: currentUser.id },
      select: { id: true, title: true, slug: true },
    });

    return NextResponse.json({
      success: true,
      webhooks,
      products,
    });
  } catch (error: any) {
    console.error("Error fetching webhooks:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ success: false, error: "No autorizado." }, { status: 401 });
    }

    const { name, url, events, productId } = await req.json();

    if (!url || !url.startsWith("http")) {
      return NextResponse.json({ success: false, error: "Ingresa una URL válida (http:// o https://)." }, { status: 400 });
    }

    // Generate secure HMAC secret key
    const secretKey = `whsec_${crypto.randomBytes(24).toString("hex")}`;

    const webhook = await prisma.webhookEndpoint.create({
      data: {
        userId: currentUser.id,
        productId: productId || null,
        name: name?.trim() || "Mi Webhook",
        url: url.trim(),
        secretKey,
        events: events || "order.completed,order.refunded,cart.abandoned",
        isActive: true,
      },
    });

    return NextResponse.json({
      success: true,
      webhook,
      message: "Webhook registrado exitosamente.",
    });
  } catch (error: any) {
    console.error("Error creating webhook:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ success: false, error: "No autorizado." }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "ID de webhook requerido." }, { status: 400 });
    }

    // Ensure user owns this webhook
    const existing = await prisma.webhookEndpoint.findFirst({
      where: { id, userId: currentUser.id },
    });

    if (!existing) {
      return NextResponse.json({ success: false, error: "Webhook no encontrado." }, { status: 404 });
    }

    await prisma.webhookEndpoint.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Webhook eliminado." });
  } catch (error: any) {
    console.error("Error deleting webhook:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ success: false, error: "No autorizado." }, { status: 401 });
    }

    const { id, isActive } = await req.json();

    const existing = await prisma.webhookEndpoint.findFirst({
      where: { id, userId: currentUser.id },
    });

    if (!existing) {
      return NextResponse.json({ success: false, error: "Webhook no encontrado." }, { status: 404 });
    }

    const updated = await prisma.webhookEndpoint.update({
      where: { id },
      data: { isActive: !!isActive },
    });

    return NextResponse.json({ success: true, webhook: updated });
  } catch (error: any) {
    console.error("Error updating webhook:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
