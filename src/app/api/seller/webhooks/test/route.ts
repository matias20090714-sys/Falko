import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { dispatchWebhook, generateSampleWebhookPayload } from "@/lib/webhooks";

export async function POST(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ success: false, error: "No autorizado." }, { status: 401 });
    }

    const { webhookId, url, event = "order.completed", productId } = await req.json();

    let targetWebhook = null;
    let customProduct = null;

    if (productId) {
      customProduct = await prisma.product.findUnique({
        where: { id: productId },
      });
    }

    if (webhookId) {
      targetWebhook = await prisma.webhookEndpoint.findFirst({
        where: { id: webhookId, userId: currentUser.id },
      });
    }

    const hookToTest = targetWebhook || {
      id: "temp_test_id",
      url: url?.trim(),
      secretKey: "whsec_test_demo_key_982341209384",
    };

    if (!hookToTest.url) {
      return NextResponse.json({ success: false, error: "URL de webhook no válida." }, { status: 400 });
    }

    const samplePayload = generateSampleWebhookPayload(event, customProduct);
    const result = await dispatchWebhook(hookToTest, event, samplePayload);

    return NextResponse.json({
      success: true,
      result: {
        httpStatus: result.statusCode,
        isSuccess: result.success,
        durationMs: result.durationMs,
        responseBody: result.responseBody || (result.success ? "OK (Empty body)" : "Sin respuesta"),
        error: result.error,
        sentPayload: samplePayload,
      },
    });
  } catch (error: any) {
    console.error("Error testing webhook:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
