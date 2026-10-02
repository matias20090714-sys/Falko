import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");

    if (!currentUser || !productId) {
      return NextResponse.json({ hasPurchased: false });
    }

    const existingOrder = await prisma.order.findFirst({
      where: {
        buyerId: currentUser.id,
        status: "CONFIRMED",
        items: {
          some: { productId },
        },
      },
    });

    const existingSub = await prisma.subscription.findFirst({
      where: {
        userId: currentUser.id,
        productId,
        status: "ACTIVE",
      },
    });

    const hasPurchased = !!existingOrder || !!existingSub;

    return NextResponse.json({
      hasPurchased,
      userEmail: currentUser.email,
      userId: currentUser.id,
    }, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      },
    });
  } catch (error: any) {
    return NextResponse.json({ hasPurchased: false, error: error.message });
  }
}
