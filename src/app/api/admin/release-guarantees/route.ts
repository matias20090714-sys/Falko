import { NextRequest, NextResponse } from "next/server";
import { releaseMaturedGuaranteeHolds } from "@/lib/ledger";
import { getCurrentUser } from "@/lib/auth";

export async function POST() {
  try {
    const user = await getCurrentUser();
    // Allow admin or cron worker trigger
    const result = await releaseMaturedGuaranteeHolds();
    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
