import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getUserWallet } from "@/lib/ledger";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "No autenticado." }, { status: 401 });
    }

    const { amount, methodType, accountDetails } = await req.json();

    const rawAmount = parseFloat(amount);
    if (isNaN(rawAmount) || rawAmount <= 0) {
      return NextResponse.json({ success: false, error: "Ingresa un monto válido mayor a 0 para retirar." }, { status: 400 });
    }

    const numAmount = parseFloat(rawAmount.toFixed(2));
    const wallet = await getUserWallet(user.id);
    const available = parseFloat((wallet.availableBalance || 0).toFixed(2));

    // Rule 21: El usuario solamente puede retirar available_balance. NUNCA pending_balance. Ni un centavo más.
    if (numAmount > available) {
      return NextResponse.json(
        {
          success: false,
          error: `Solo puedes retirar tu saldo disponible actual ($${available.toFixed(2)} ${wallet.currencyCode}). No es posible solicitar ni un centavo más. Tu saldo pendiente ($${wallet.pendingBalance.toFixed(2)} ${wallet.currencyCode}) está protegido por garantía.`,
        },
        { status: 400 }
      );
    }

    // Process withdrawal in atomic transaction
    return await prisma.$transaction(async (tx) => {
      // 1. Deduct from available balance
      const newAvailable = Math.max(0, parseFloat((available - numAmount).toFixed(2)));
      const newWithdrawn = parseFloat(((wallet.withdrawnBalance || 0) + numAmount).toFixed(2));
      const newTotal = Math.max(0, parseFloat(((wallet.totalBalance || 0) - numAmount).toFixed(2)));

      await tx.wallet.update({
        where: { id: wallet.id },
        data: {
          availableBalance: newAvailable,
          withdrawnBalance: newWithdrawn,
          totalBalance: newTotal,
        },
      });

      // 2. Create or find withdrawal method
      const withdrawalMethod = await tx.withdrawalMethod.create({
        data: {
          userId: user.id,
          countryCode: user.countryCode,
          methodType: methodType || "BANK_TRANSFER",
          accountDetailsJson: JSON.stringify(accountDetails || {}),
        },
      });

      // 3. Create Withdrawal record
      const withdrawalNumber = `WTH-${Date.now().toString().slice(-6)}`;
      const withdrawal = await tx.withdrawal.create({
        data: {
          withdrawalNumber,
          userId: user.id,
          walletId: wallet.id,
          withdrawalMethodId: withdrawalMethod.id,
          amount: numAmount,
          currencyCode: wallet.currencyCode,
          status: "PENDING",
        },
      });

      // 4. Record ledger transaction
      await tx.walletTransaction.create({
        data: {
          walletId: wallet.id,
          type: "WITHDRAWAL_REQUESTED",
          amount: -numAmount,
          balanceAfter: newAvailable,
          currencyCode: wallet.currencyCode,
          description: `Solicitud de retiro #${withdrawalNumber} vía ${methodType}`,
          referenceId: withdrawal.id,
        },
      });

      // 5. Notify user
      await tx.notification.create({
        data: {
          userId: user.id,
          title: "Solicitud de retiro recibida 💸",
          message: `Tu solicitud de retiro #${withdrawalNumber} por $${numAmount} ${wallet.currencyCode} está siendo procesada por administración.`,
          type: "WITHDRAWAL_REQUESTED",
          linkUrl: "/withdrawals",
        },
      });

      return NextResponse.json({
        success: true,
        withdrawalNumber,
        availableBalanceAfter: newAvailable,
        message: "Solicitud de retiro enviada exitosamente.",
      });
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
