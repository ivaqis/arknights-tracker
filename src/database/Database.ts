import { PrismaClient } from "@prisma/client";

export class Database {
    private readonly _prisma: PrismaClient;

    public constructor(prisma: PrismaClient) {
        const isValid = Database.isPrismaValid(prisma);

        if (!isValid) {
            throw new Error("Invalid prisma client");
        }

        this._prisma = prisma;
    }

    private get userTable() {
        return this._prisma.user;
    }

    private get userBannerStatTable() {
        return this._prisma.userBannerStat;
    }

    private get userBannerTypeStatTable() {
        return this._prisma.userBannerTypeStat;
    }

    private get userCharBannerPullsTable() {
        return this._prisma.userCharBannerPulls;
    }

    private get userCharBannerTypePullsTable() {
        return this._prisma.userCharBannerTypePulls;
    }

    private get userWeaponBannerPullsTable() {
        return this._prisma.userWeaponBannerPulls;
    }

    private get importErrorTable() {
        return this._prisma.importError;
    }

    private get globalBannerStatsTable() {
        return this._prisma.globalBannerStats;
    }

    private get globalBannerTimelineTable() {
        return this._prisma.globalBannerTimeline;
    }

    private get globalPityDistributionTable() {
        return this._prisma.globalPityDistribution;
    }

    private get globalItemStatsTable() {
        return this._prisma.globalItemStats;
    }

    private static isPrismaValid(prisma: PrismaClient): boolean {
        return Boolean(
            prisma
            && prisma.user
            && prisma.userBannerStat
            && prisma.userBannerTypeStat
            && prisma.userCharBannerPulls
            && prisma.userCharBannerTypePulls
            && prisma.userWeaponBannerPulls
            && prisma.globalBannerStats
            && prisma.globalBannerTimeline
            && prisma.globalPityDistribution
            && prisma.globalItemStats
            && prisma.importError
        );
    }
}