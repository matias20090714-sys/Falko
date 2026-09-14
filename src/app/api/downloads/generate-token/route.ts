import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { generateSignedDownloadUrl } from "@/lib/storage";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "No autenticado." }, { status: 401 });
    }

    const { fileId, orderId } = await req.json();

    // Verify order belongs to user and is confirmed
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: {
              include: { files: true },
            },
          },
        },
      },
    });

    if (!order || order.buyerId !== user.id || order.status !== "CONFIRMED") {
      return NextResponse.json({ success: false, error: "No tienes autorización para acceder a este archivo." }, { status: 403 });
    }

    // Verify file is part of purchased product
    const validFile = order.items.some((item) => item.product.files.some((f) => f.id === fileId));
    if (!validFile) {
      return NextResponse.json({ success: false, error: "Archivo no encontrado en tu orden." }, { status: 404 });
    }

    const downloadUrl = generateSignedDownloadUrl({
      fileId,
      userId: user.id,
      orderId,
      expiresInMinutes: 15,
    });

    return NextResponse.json({ success: true, downloadUrl });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
