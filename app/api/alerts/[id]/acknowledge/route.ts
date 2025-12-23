import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  await prisma.complianceAlert.update({
    where: { id },
    data: { acknowledged: true },
  });

  return NextResponse.json({ success: true });
}
