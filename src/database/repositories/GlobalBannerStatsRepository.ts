import { GlobalBannerTimelineRecord } from "@database/records/GlobalBannerTimelineRecord";
import { GlobalItemStatsRecord } from "@database/records/GlobalItemStatsRecord";
import { GlobalPityDistributionRecord } from "@database/records/GlobalPityDistributionRecord";
import { GlobalBannerData } from "@database/repositories/interfaces/GlobalBannerData";
import { Repository } from "@database/repositories/Repository";
import { GlobalBannerTimelinesTable } from "@database/tables/GlobalBannerTimelinesTable";
import { GlobalItemStatsTable } from "@database/tables/GlobalItemStatsTable";
import { GlobalPityDistributionsTable } from "@database/tables/GlobalPityDistributionsTable";
import { PrismaClient } from "@generated/prisma-v2";

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