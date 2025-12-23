import { prisma } from "@/lib/db";

export async function getAdminMetrics() {
  const [
    totalUsers,
    totalScans,
    avgScore,
    activeSchedules,
    scansByDay,
    scoreBuckets,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.scanJob.count(),
    prisma.scanJob.aggregate({
      _avg: { score: true },
    }),
    prisma.website.count({
      where: { nextScanAt: { not: null } },
    }),
    prisma.$queryRaw<
      { date: string; count: number }[]
    >`
      SELECT
        DATE("createdAt") as date,
        COUNT(*) as count
      FROM "ScanJob"
      GROUP BY DATE("createdAt")
      ORDER BY date ASC
    `,
    prisma.$queryRaw<
      { range: string; count: number }[]
    >`
      SELECT
        CASE
          WHEN score >= 90 THEN '90–100'
          WHEN score >= 75 THEN '75–89'
          WHEN score >= 60 THEN '60–74'
          ELSE '<60'
        END as range,
        COUNT(*) as count
      FROM "ScanJob"
      GROUP BY range
    `,
  ]);

  return {
    totalUsers,
    totalScans,
    avgScore: Math.round(avgScore._avg.score ?? 0),
    activeSchedules,
    scansByDay,
    scoreBuckets,
  };
}
