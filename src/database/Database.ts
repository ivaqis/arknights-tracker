import { PrismaClient } from "@prisma/client";

export class Database {
    private readonly _prisma: PrismaClient;

    constructor(prisma: PrismaClient) {
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

    private get importErrorTable() {
        return this._prisma.importError;
    }

    private get globalBannerStatsTable() {
        return this._prisma.globalBannerStats;
    }

    private get globalTimelineTable() {
        return this._prisma.globalTimeline;
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
            && prisma.importError
            && prisma.globalBannerStats
            && prisma.globalTimeline
            && prisma.globalPityDistribution
            && prisma.globalItemStats
        );
    }
}