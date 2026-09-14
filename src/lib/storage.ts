import crypto from "crypto";
import { prisma } from "./db";

const STORAGE_SECRET = process.env.STORAGE_SECRET || "falko-storage-signing-secret-2026";

export interface SignedDownloadToken {
  fileId: string;
  userId: string;
  orderId: string;
  expiresAt: number; // Unix timestamp
  signature: string;
}

/**
 * Generate a short-lived signed URL token for downloading purchased digital product files
 * Valid for 15 minutes
 */
export function generateSignedDownloadUrl(params: {
  fileId: string;
  userId: string;
  orderId: string;
  expiresInMinutes?: number;
}): string {
  const { fileId, userId, orderId, expiresInMinutes = 15 } = params;
  const expiresAt = Math.floor(Date.now() / 1000) + expiresInMinutes * 60;

  const payload = `${fileId}:${userId}:${orderId}:${expiresAt}`;
  const signature = crypto.createHmac("sha256", STORAGE_SECRET).update(payload).digest("hex");

  const token = Buffer.from(
    JSON.stringify({
      fileId,
      userId,
      orderId,
      expiresAt,
      signature,
    })
  ).toString("base64url");

  return `/api/downloads/signed-file?token=${token}`;
}

/**
 * Verify signed download token and check that user actually owns the active, non-refunded purchase
 */
export async function verifyAndAuthorizeDownload(tokenString: string) {
  try {
    const decoded = JSON.parse(Buffer.from(tokenString, "base64url").toString("utf-8")) as SignedDownloadToken;
    const { fileId, userId, orderId, expiresAt, signature } = decoded;

    // Check expiration
    const now = Math.floor(Date.now() / 1000);
    if (now > expiresAt) {
      return { valid: false, error: "El enlace de descarga temporal ha expirado. Genera uno nuevo desde tu biblioteca." };
    }

    // Verify cryptographic signature
    const expectedPayload = `${fileId}:${userId}:${orderId}:${expiresAt}`;
    const expectedSignature = crypto.createHmac("sha256", STORAGE_SECRET).update(expectedPayload).digest("hex");

    if (signature !== expectedSignature) {
      return { valid: false, error: "Firma de descarga inválida o alterada." };
    }

    // Verify ownership in database & confirm order is active and not refunded
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

    if (!order || order.buyerId !== userId) {
      return { valid: false, error: "No tienes autorización para descargar este archivo." };
    }

    if (order.status !== "CONFIRMED") {
      return { valid: false, error: "La orden no se encuentra activa o ha sido reembolsada." };
    }

    // Find requested file
    const file = await prisma.productFile.findUnique({
      where: { id: fileId },
      include: { product: true },
    });

    if (!file) {
      return { valid: false, error: "El archivo digital no fue encontrado." };
    }

    // Increment download count
    await prisma.productFile.update({
      where: { id: fileId },
      data: { downloadCount: { increment: 1 } },
    });

    return {
      valid: true,
      file,
      order,
    };
  } catch (error) {
    return { valid: false, error: "Token de descarga inválido." };
  }
}
