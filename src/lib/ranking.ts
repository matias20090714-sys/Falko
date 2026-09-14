import { prisma } from "./db";
export {
  type MilestoneTier,
  RANKING_TIERS,
  getTierForVolume,
  calculateTierProgress,
} from "./ranking-types";
import { getTierForVolume, calculateTierProgress } from "./ranking-types";

/**
 * Update sales volume for a user (Seller or Affiliate) when an order is confirmed
 */
export async function addSalesVolume(userId: string, volumeUsd: number) {
  if (volumeUsd <= 0) return;

  const periods = ["ALL_TIME", "MONTH", "WEEK"];
  const now = new Date();
  const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  
  // Calculate current ISO week
  const janFirst = new Date(now.getFullYear(), 0, 1);
  const days = Math.floor((now.getTime() - janFirst.getTime()) / (24 * 60 * 60 * 1000));
  const weekNumber = Math.ceil((days + janFirst.getDay() + 1) / 7);
  const weekKey = `${now.getFullYear()}-W${weekNumber}`;

  for (const period of periods) {
    const periodKey = period === "ALL_TIME" ? "ALL" : period === "MONTH" ? monthKey : weekKey;

    const existing = await prisma.rankingRecord.findUnique({
      where: {
        userId_period_periodKey: {
          userId,
          period,
          periodKey,
        },
      },
    });

    const newVolume = existing ? parseFloat((existing.salesVolumeUsd + volumeUsd).toFixed(2)) : volumeUsd;
    const tier = getTierForVolume(newVolume).id;

    await prisma.rankingRecord.upsert({
      where: {
        userId_period_periodKey: {
          userId,
          period,
          periodKey,
        },
      },
      create: {
        userId,
        period,
        periodKey,
        salesVolumeUsd: newVolume,
        currentTier: tier,
      },
      update: {
        salesVolumeUsd: newVolume,
        currentTier: tier,
      },
    });
  }
}

/**
 * Get personalized ranking data for the current user
 */
export async function getUserRankingProgress(userId: string) {
  const allTimeRecord = await prisma.rankingRecord.findUnique({
    where: {
      userId_period_periodKey: {
        userId,
        period: "ALL_TIME",
        periodKey: "ALL",
      },
    },
  });

  const volumeUsd = allTimeRecord?.salesVolumeUsd || 0;
  const progress = calculateTierProgress(volumeUsd);

  // Get user rank position among all active users
  const higherVolumeUsersCount = await prisma.rankingRecord.count({
    where: {
      period: "ALL_TIME",
      periodKey: "ALL",
      salesVolumeUsd: { gt: volumeUsd },
    },
  });

  const rankPosition = volumeUsd > 0 ? higherVolumeUsersCount + 1 : 0;

  return {
    ...progress,
    rankPosition,
  };
}

/**
 * Get top ranking leaders for the public /ranking page
 */
export async function getLeaderboard(period = "ALL_TIME", limit = 50) {
  const now = new Date();
  const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const janFirst = new Date(now.getFullYear(), 0, 1);
  const days = Math.floor((now.getTime() - janFirst.getTime()) / (24 * 60 * 60 * 1000));
  const weekNumber = Math.ceil((days + janFirst.getDay() + 1) / 7);
  const weekKey = `${now.getFullYear()}-W${weekNumber}`;

  const periodKey = period === "ALL_TIME" ? "ALL" : period === "MONTH" ? monthKey : weekKey;

  const records = await prisma.rankingRecord.findMany({
    where: {
      period,
      periodKey,
      salesVolumeUsd: { gt: 0 },
    },
    orderBy: {
      salesVolumeUsd: "desc",
    },
    take: limit,
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          avatarUrl: true,
          countryCode: true,
        },
      },
    },
  });

  return records.map((rec, index) => ({
    rank: index + 1,
    userId: rec.user.id,
    name: `${rec.user.firstName} ${rec.user.lastName}`,
    avatarUrl: rec.user.avatarUrl,
    countryCode: rec.user.countryCode,
    salesVolumeUsd: rec.salesVolumeUsd,
    tier: getTierForVolume(rec.salesVolumeUsd),
  }));
}
