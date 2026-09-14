import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const admin = await getCurrentUser();
    if (!admin || !admin.roles.includes("ADMIN")) {
      return NextResponse.json({ success: false, error: "Acceso denegado." }, { status: 403 });
    }

    const { withdrawalId, action, notes } = await req.json(); // action: "PAID" | "REJECT"

    const withdrawal = await prisma.withdrawal.findUnique({
      where: { id: withdrawalId },
      include: { wallet: true },
    });

    if (!withdrawal) {
      return NextResponse.json({ success: false, error: "Retiro no encontrado." }, { status: 404 });
    }

    return await prisma.$transaction(async (tx) => {
      if (action === "PAID") {
        await tx.withdrawal.update({
          where: { id: withdrawalId },
          data: {
            status: "PAID",
            adminNotes: notes || "Transferencia confirmada y pagada.",
            processedAt: new Date(),
          },
        });

        await tx.walletTransaction.create({
          data: {
            walletId: withdrawal.walletId,
            type: "WITHDRAWAL_PAID",
            amount: 0,
            balanceAfter: withdrawal.wallet.availableBalance,
            currencyCode: withdrawal.currencyCode,
            description: `Retiro #${withdrawal.withdrawalNumber} completado y liquidado por tesorería`,
            referenceId: withdrawal.id,
          },
        });

        await tx.notification.create({
          data: {
            userId: withdrawal.userId,
            title: "¡Retiro pagado exitosamente! 🚀",
            message: `Tu retiro #${withdrawal.withdrawalNumber} por $${withdrawal.amount} ${withdrawal.currencyCode} ha sido transferido.`,
            type: "WITHDRAWAL_PAID",
            linkUrl: "/withdrawals",
          },
        });
      } else if (action === "REJECT") {
        // Refund back to available balance
        const newAvailable = parseFloat((withdrawal.wallet.availableBalance + withdrawal.amount).toFixed(2));
        const newWithdrawn = Math.max(0, parseFloat((withdrawal.wallet.withdrawnBalance - withdrawal.amount).toFixed(2)));
        const newTotal = parseFloat((withdrawal.wallet.totalBalance + withdrawal.amount).toFixed(2));

        await tx.wallet.update({
          where: { id: withdrawal.walletId },
          data: {
            availableBalance: newAvailable,
            withdrawnBalance: newWithdrawn,
            totalBalance: newTotal,
          },
        });

        await tx.withdrawal.update({
          where: { id: withdrawalId },
          data: {
            status: "REJECTED",
            adminNotes: notes || "Rechazado por datos bancarios incompletos o error de beneficiario.",
            processedAt: new Date(),
          },
        });

        await tx.walletTransaction.create({
          data: {
            walletId: withdrawal.walletId,
            type: "WITHDRAWAL_REJECTED",
            amount: withdrawal.amount,
            balanceAfter: newAvailable,
            currencyCode: withdrawal.currencyCode,
            description: `Retiro #${withdrawal.withdrawalNumber} rechazado - Fondos restituidos a disponible (${notes || ""})`,
            referenceId: withdrawal.id,
          },
        });

        await tx.notification.create({
          data: {
            userId: withdrawal.userId,
            title: "Retiro rechazado",
            message: `Tu retiro #${withdrawal.withdrawalNumber} no pudo ser procesado (${notes || "datos incorrectos"}). Los fondos han regresado a tu saldo disponible.`,
            type: "WITHDRAWAL_REJECTED",
            linkUrl: "/withdrawals",
          },
        });
      }

      await tx.adminLog.create({
        data: {
          adminId: admin.id,
          action: `WITHDRAWAL_${action}`,
          targetType: "WITHDRAWAL",
          targetId: withdrawalId,
          details: notes,
        },
      });

      return NextResponse.json({ success: true });
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
