import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const { url } = await req.json();

  // ✅ MUST await auth()
  const { userId } = await auth();

  if (!url) {
    return NextResponse.json({ error: "Missing URL" }, { status: 400 });
  }

  const scan = await prisma.scan.create({
    data: {
      url,
      userId: userId ?? null,     // ✅ anonymous allowed
      score: 62,
      riskLevel: "Medium",
      summaryIssues: ["Missing alt text"],
      allIssues: [
        {
          id: "alt-text",
          title: "Images missing alt text",
          severity: "high",
          description: "Screen readers cannot interpret images.",
          fix: "Add descriptive alt attributes.",
        },
      ],
    },
  });

  return NextResponse.json({ scanId: scan.id });
}
