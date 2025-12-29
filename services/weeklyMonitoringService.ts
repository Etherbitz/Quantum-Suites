import { prisma } from "@/lib/db";
import { sendEmail } from "@/services/emailService";

interface WeeklyMonitoringResult {
  processedUsers: number;
  emailedUsers: number;
}

export async function sendWeeklyMonitoringEmails(
  since: Date
): Promise<WeeklyMonitoringResult> {
  const users = await prisma.user.findMany({
    where: {
      plan: {
        in: ["starter", "business", "agency"],
      },
    },
    select: {
      id: true,
      email: true,
      plan: true,
    },
  });

  let processedUsers = 0;
  let emailedUsers = 0;

  for (const user of users) {
    processedUsers++;

    if (!user.email) continue;

    const [websites, scans, alerts] = await Promise.all([
      prisma.website.findMany({
        where: { userId: user.id },
        select: { id: true },
      }),
      prisma.scanJob.findMany({
        where: {
          userId: user.id,
          status: "COMPLETED",
          createdAt: {
            gte: since,
          },
        },
        select: {
          score: true,
          createdAt: true,
          website: {
            select: { url: true },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.complianceAlert.findMany({
        where: {
          userId: user.id,
          createdAt: {
            gte: since,
          },
        },
        select: {
          currentScore: true,
          previousScore: true,
          delta: true,
          severity: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    const siteCount = websites.length;
    const scanCount = scans.length;
    const alertCount = alerts.length;

    if (scanCount === 0 && alertCount === 0) {
      // Nothing meaningful happened for this user in the period.
      continue;
    }

    const scores = scans
      .map((s) => s.score ?? null)
      .filter((s): s is number => typeof s === "number");

    const avgScore =
      scores.length > 0
        ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
        : null;

    let lowestSiteLine = "None";

    if (scans.length > 0) {
      const worst = [...scans]
        .filter((s) => typeof s.score === "number")
        .sort((a, b) => (a.score ?? 0) - (b.score ?? 0))[0];

      if (worst && worst.website) {
        lowestSiteLine = `${worst.website.url} (score ${worst.score ?? 0}/100)`;
      }
    }

    const alertSummaryLine =
      alertCount > 0
        ? `${alertCount} compliance alert${alertCount === 1 ? "" : "s"} triggered`
        : "No new compliance alerts";

    const lines: string[] = [];

    lines.push("Hi there,");
    lines.push("");
    lines.push(
      "Here is your weekly Quantum Suites AI monitoring summary for the last 7 days."
    );
    lines.push("");
    lines.push(`Plan: ${user.plan}`);
    lines.push(`Websites monitored: ${siteCount}`);
    lines.push(`Scans run: ${scanCount}`);
    lines.push(
      `Average score: ${
        typeof avgScore === "number" ? `${avgScore}/100` : "No recent scores"
      }`
    );
    lines.push(`Lowest scoring site: ${lowestSiteLine}`);
    lines.push(alertSummaryLine + ".");
    lines.push("");

    if (alertCount > 0) {
      const topAlerts = alerts.slice(0, 3);
      lines.push("Recent alerts:");
      for (const alert of topAlerts) {
        const when = alert.createdAt.toISOString().split("T")[0];
        lines.push(
          `- [${when}] ${alert.severity.toUpperCase()} drop of ${
            alert.delta
          } points (from ${alert.previousScore} to ${alert.currentScore})`
        );
      }
      lines.push("");
    }

    lines.push(
      "View full details and recommendations in your dashboard: https://www.quantumsuites-ai.com/dashboard"
    );
    lines.push("");
    lines.push("You are receiving this because monitoring is enabled for your plan.");
    lines.push("Thanks for using Quantum Suites AI.");

    await sendEmail({
      to: user.email,
      subject: "Your weekly Quantum Suites AI monitoring summary",
      text: lines.join("\n"),
    });

    emailedUsers++;
  }

  return { processedUsers, emailedUsers };
}
