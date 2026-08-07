import { database } from "@/serviceInstances.js";
import { GlobalStatsQuery } from "@api/contracts/globalStats/GlobalStatsQuery.js";
import { GlobalStatsResponse } from "@api/contracts/globalStats/GlobalStatsResponse.js";
import { ResponseBody } from "@api/contracts/ResponseBody.js";
import { Controller } from "@api/controllers/Controller.js";
import { Database } from "@database/Database.js";
import { GlobalItemData } from "@models/globalBannerStats/GlobalItemData.js";
import { GlobalPityData } from "@models/globalBannerStats/GlobalPityData.js";
import { GlobalTimelineData } from "@models/globalBannerStats/GlobalTimelineData.js";
import e from "express";

export class GlobalStats extends Controller<
    {},
    GlobalStatsResponse,
    undefined,
    GlobalStatsQuery
> {
    public readonly name = "GlobalStats";

    private readonly _database: Database = database;

    private readonly _bannerId: string;

    public constructor(req: e.Request<{}, ResponseBody<GlobalStatsResponse>, undefined, GlobalStatsQuery>, res: e.Response<ResponseBody<GlobalStatsResponse>>) {
        super(req, res);

        this._bannerId = req.query.bannerId;
    }

    private static getMedianPity(pityDistribution: GlobalPityData[], itemsCount: number): number {
        const half = itemsCount / 2;

        let counter = 0;

        for (const item of pityDistribution) {
            if (item.pity === 0) {
                continue;
            }

            counter += item.count;

            if (counter >= half) {
                return item.pity;
            }
        }

        return 0;
    }

    protected async execute(): Promise<void> {
        const bannerData = await this._database.userBannerStats.getGlobalBannerStats(this._bannerId);

        if (bannerData.totalUsers === 0) {
            this.data = {
                bannerId: this._bannerId,
                stats: {
                    totalUsers: 0,
                    totalPulls: 0,
                    total6: 0,
                    total5: 0,
                    total5050: 0,
                    totalWon5050: 0,
                    totalLimited: 0,
                    freePulls: 0,
                    free6: 0,
                    free5: 0,
                    freeWon5050: 0,
                    oroberylSpent: 0,
                    medianPity6: 0,
                    medianPity5: 0
                },
                timeline: [],
                pityDistribution6: [],
                pityDistribution5: [],
                items6: [],
                items5: []
            };

            return;
        }

        const totalPulls = bannerData.freePulls + bannerData.unfreePulls;
        const totalLimited = bannerData.won5050 + bannerData.total6 - bannerData.total5050;

        const groupedPityDistribution = await this.getGroupedPityDistribution(bannerData.total6, bannerData.total5);
        const groupedItems = await this.getGroupedItems(bannerData.total6, bannerData.total5);
        const timeline = await this.getTimeline(totalPulls);

        const pityDistribution6 = groupedPityDistribution.get(6) ?? [];
        const pityDistribution5 = groupedPityDistribution.get(5) ?? [];

        this.data = {
            bannerId: this._bannerId,
            stats: {
                totalUsers: bannerData.totalUsers,
                totalPulls,
                total6: bannerData.total6,
                total5: bannerData.total5,
                total5050: bannerData.total5050,
                totalWon5050: bannerData.won5050,
                totalLimited,
                freePulls: bannerData.freePulls,
                free6: bannerData.free6,
                free5: bannerData.free5,
                freeWon5050: bannerData.freeWin5050,
                oroberylSpent: bannerData.unfreePulls * 500,
                medianPity6: GlobalStats.getMedianPity(pityDistribution6, bannerData.total6 - bannerData.free6),
                medianPity5: GlobalStats.getMedianPity(pityDistribution5, bannerData.total5 - bannerData.free5)
            },
            timeline: timeline,
            pityDistribution6,
            pityDistribution5,
            items6: groupedItems.get(6) ?? [],
            items5: groupedItems.get(5) ?? []
        };
    }

    private async getGroupedPityDistribution(total6: number, total5: number): Promise<Map<number, GlobalPityData[]>> {
        const data = await this._database.globalBannerStats.getPityDistribution(this._bannerId);

        const map = new Map<number, GlobalPityData[]>();

        for (const item of data) {
            if (item.rarity !== 6 && item.rarity !== 5) {
                continue;
            }

            let list = map.get(item.rarity);

            if (!list) {
                list = [];
                map.set(item.rarity, list);
            }

            list.push({
                pity: item.pity,
                count: item.count.initValue,
                rate: item.count.initValue / (item.rarity === 6 ? total6 : total5),
            });
        }

        return map;
    }

    private async getTimeline(totalPulls: number): Promise<GlobalTimelineData[]> {
        const data = await this._database.globalBannerStats.getBannerTimeline(this._bannerId);

        return data.map(r => {
            return {
                date: r.date,
                totalPulls: r.totalPullsCount.initValue,
                freePulls: r.freePullsCount.initValue,
                rate: r.totalPullsCount.initValue / totalPulls
            } satisfies GlobalTimelineData;
        });
    }

    private async getGroupedItems(total6: number, total5: number): Promise<Map<number, GlobalItemData[]>> {
        const items = await this._database.globalBannerStats.getItemStats(this._bannerId);

        const map = new Map<number, GlobalItemData[]>();

        for (const item of items) {
            if (item.rarity !== 6 && item.rarity !== 5) {
                continue;
            }

            let list = map.get(item.rarity);

            if (!list) {
                list = [];
                map.set(item.rarity, list);
            }

            list.push({
                itemId: item.itemId,
                count: item.count.initValue,
                rate: item.count.initValue / (item.rarity === 6 ? total6 : total5)
            });
        }

        return map;
    }
}