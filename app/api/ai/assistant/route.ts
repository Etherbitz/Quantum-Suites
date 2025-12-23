import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import OpenAI from "openai";

import { prisma } from "@/lib/db";
import { getOrCreateUser } from "@/lib/getOrCreateUser";
import { hasFeature } from "@/lib/featureAccess";
import { PLANS, type Plan } from "@/lib/plans";

export const runtime = "nodejs";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    if (!openai.apiKey) {
      return NextResponse.json(
        { error: "AI assistant is not configured. Set OPENAI_API_KEY." },
        { status: 500 }
      );
    }

    const { userId } = await auth();
    const clerkUser = await currentUser();

    const email = clerkUser?.emailAddresses?.[0]?.emailAddress;

    if (!userId || !email) {
      return NextResponse.json(
        { error: "Unauthenticated" },
        { status: 401 }
      );
    }

    const user = await getOrCreateUser(userId, email);

    const rawPlan = String(user.plan ?? "free").toLowerCase();
    const allowedPlans: Plan[] = ["free", "starter", "business", "agency"];
    const plan: Plan = (allowedPlans.includes(rawPlan as Plan)
      ? (rawPlan as Plan)
      : "free") as Plan;

    if (!hasFeature(plan, "aiAssistant")) {
      return NextResponse.json(
        { error: "AI assistant is available on Business and Agency plans." },
        { status: 403 }
      );
    }

    // Enforce per-plan AI usage caps (monthly)
    const aiLimit = (PLANS[plan] as any).aiMonthlyRequests as number | undefined;
    if (typeof aiLimit === "number" && aiLimit >= 0) {
      const now = new Date();
      const periodStart = new Date(
        Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)
      );

      const usage = await (prisma as any).aiUsage.findFirst({
        where: { userId: user.id, periodStart },
      });

      const currentCount = usage?.count ?? 0;

      // Hard cap for Business: 5 uses/month then require upgrade
      if (plan === "business" && currentCount >= aiLimit) {
        const resetAt = new Date(
          Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1)
        );
        return NextResponse.json(
          {
            error: "AI_LIMIT_REACHED",
            message:
              "You have used your 5 included AI assistant sessions this month. Upgrade to Agency for higher limits.",
            resetAt,
          },
          { status: 429 }
        );
      }

      // Hard cap for Agency: 500 uses/month then require contact for higher-volume pricing
      if (plan === "agency" && currentCount >= aiLimit) {
        const resetAt = new Date(
          Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1)
        );
        return NextResponse.json(
          {
            error: "AI_LIMIT_REACHED",
            message:
              "You have used your 500 included AI assistant replies this month. Contact us to discuss higher-volume Agency pricing.",
            resetAt,
          },
          { status: 429 }
        );
      }

      await (prisma as any).aiUsage.upsert({
        where: {
          userId_periodStart: {
            userId: user.id,
            periodStart,
          },
        },
        update: { count: { increment: 1 } },
        create: {
          userId: user.id,
          periodStart,
          count: 1,
        },
      });
    }

    const body = (await req.json()) as {
      scanId?: string;
      question?: string;
    };

    if (!body.scanId) {
      return NextResponse.json(
        { error: "Missing scanId" },
        { status: 400 }
      );
    }

    const scan = await prisma.scanJob.findUnique({
      where: { id: body.scanId },
      select: {
        id: true,
        score: true,
        summary: true,
        results: true,
        createdAt: true,
        website: {
          select: { url: true },
        },
      },
    });

    if (!scan) {
      return NextResponse.json(
        { error: "Scan not found" },
        { status: 404 }
      );
    }

    const question = (body.question || "Explain these scan findings and suggest concrete, implementation-ready fixes.").trim();

    const issues = Array.isArray((scan.results as any)?.issues)
      ? (scan.results as any).issues
      : Array.isArray(scan.results)
      ? (scan.results as any)
      : [];

    const truncatedIssues = issues.slice(0, 40); // keep payload reasonable

    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      {
        role: "system",
        content:
          "You are an expert web accessibility, privacy, and security consultant. You explain issues in clear, non-legal language and give specific code-level fixes (HTML, CSS, JS) or CMS instructions. Keep answers focused and practical.",
      },
      {
        role: "user",
        content: [
          "Here is a compliance scan for a website.",
          scan.website?.url ? `URL: ${scan.website.url}` : "",
          scan.score != null ? `Overall score: ${scan.score}/100` : "",
          (scan.summary as any)?.riskLevel
            ? `Risk level: ${String((scan.summary as any).riskLevel)}`
            : "",
          "Top issues (truncated):",
          JSON.stringify(truncatedIssues, null, 2),
          "User question:",
          question,
        ]
          .filter(Boolean)
          .join("\n"),
      },
    ];

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      temperature: 0.2,
    });

    const answer =
      completion.choices[0]?.message?.content ??
      "I wasn't able to generate suggestions right now. Please try again.";

    return NextResponse.json({ answer });
  } catch (error) {
    console.error("AI assistant error", error);
    return NextResponse.json(
      { error: "Failed to generate AI suggestions" },
      { status: 500 }
    );
  }
}
