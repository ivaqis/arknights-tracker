import { GlobalBannerTimelineRecord } from "@database/records/GlobalBannerTimelineRecord.js";
import { GlobalItemStatsRecord } from "@database/records/GlobalItemStatsRecord.js";
import { GlobalPityDistributionRecord } from "@database/records/GlobalPityDistributionRecord.js";
import { GlobalBannerData } from "@database/repositories/interfaces/GlobalBannerData.js";
import { Repository } from "@database/repositories/Repository.js";
import { GlobalBannerTimelinesTable } from "@database/tables/GlobalBannerTimelinesTable.js";
import { GlobalItemStatsTable } from "@database/tables/GlobalItemStatsTable.js";
import { GlobalPityDistributionsTable } from "@database/tables/GlobalPityDistributionsTable.js";
import { PrismaClient } from "@generated/prisma-v2/index.js";

export class GlobalBannerStatsRepository extends Repository {
    private readonly _globalBannerTimelinesTable: GlobalBannerTimelinesTable;
    private readonly _globalPityDistributionsTable: GlobalPityDistributionsTable;
    private readonly _globalItemStatsTable: GlobalItemStatsTable;

    public constructor(prisma: PrismaClient) {
        super(prisma);

        this._globalBannerTimelinesTable = new GlobalBannerTimelinesTable(prisma);
        this._globalPityDistributionsTable = new GlobalPityDistributionsTable(prisma);
        this._globalItemStatsTable = new GlobalItemStatsTable(prisma);
    }

    public async getBannerTimelineRecord(bannerId: string, date: string): Promise<GlobalBannerTimelineRecord> {
        return this._globalBannerTimelinesTable.get(bannerId, date);
    }

    public async updateBannerTimelineRecord(record: GlobalBannerTimelineRecord) {
        await this._globalBannerTimelinesTable.update(record);
    }

    public async getBannerTimeline(bannerId: string): Promise<GlobalBannerTimelineRecord[]> {
        return this._globalBannerTimelinesTable.getAllByBannerId(bannerId);
    }

    public async getPityDistributionRecord(bannerId: string, pity: number, rarity: number): Promise<GlobalPityDistributionRecord> {
        return this._globalPityDistributionsTable.get(bannerId, pity, rarity);
    }

    public async updatePityDistributionRecord(record: GlobalPityDistributionRecord) {
        await this._globalPityDistributionsTable.update(record);
    }

    public async getPityDistribution(bannerId: string): Promise<GlobalPityDistributionRecord[]> {
        return this._globalPityDistributionsTable.getAllByBannerId(bannerId);
    }

    public async getItemStatsRecord(bannerId: string, itemId: string, rarity: number): Promise<GlobalItemStatsRecord> {
        return this._globalItemStatsTable.get(bannerId, itemId, rarity);
    }

    public async updateItemStatsRecord(record: GlobalItemStatsRecord) {
        await this._globalItemStatsTable.update(record);
    }

    public async getItemStats(bannerId: string): Promise<GlobalItemStatsRecord[]> {
        return this._globalItemStatsTable.getAllByBannerId(bannerId);
    }

    public async getBannerData(bannerId: string): Promise<GlobalBannerData> {
        const timeline = await this.getBannerTimeline(bannerId);
        const pityDistribution = await this.getPityDistribution(bannerId);
        const itemStats = await this.getItemStats(bannerId);

        return {
            timeline,
            pityDistribution,
            itemStats
        };
    }
}