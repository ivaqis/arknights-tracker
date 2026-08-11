import { Database } from "@database/Database.js";
import { GlobalItemStatsRecord } from "@database/records/GlobalItemStatsRecord.js";
import { GlobalPityDistributionRecord } from "@database/records/GlobalPityDistributionRecord.js";
import { Banner } from "@models/banners/Banner.js";
import { GlobalBannerDataBeginner } from "@models/globalBannerStats/entities/GlobalBannerDataBeginner.js";
import { GlobalBannerDataJointV1 } from "@models/globalBannerStats/entities/GlobalBannerDataJointV1.js";
import { GlobalBannerDataJointV2 } from "@models/globalBannerStats/entities/GlobalBannerDataJointV2.js";
import { GlobalBannerDataSpecialV1 } from "@models/globalBannerStats/entities/GlobalBannerDataSpecialV1.js";
import { GlobalBannerDataSpecialV2 } from "@models/globalBannerStats/entities/GlobalBannerDataSpecialV2.js";
import { GlobalBannerDataStandard } from "@models/globalBannerStats/entities/GlobalBannerDataStandard.js";
import { GlobalBannerDataWeaponV1 } from "@models/globalBannerStats/entities/GlobalBannerDataWeaponV1.js";
import { GlobalBannerDataWeaponV2 } from "@models/globalBannerStats/entities/GlobalBannerDataWeaponV2.js";
import { GlobalItemStatData } from "@models/globalBannerStats/entities/items/GlobalItemStatData.js";
import {
    GlobalPityDistributionData
} from "@models/globalBannerStats/entities/pityDistribution/GlobalPityDistributionData.js";
import { GlobalTimelineData } from "@models/globalBannerStats/entities/timeline/GlobalTimelineData.js";
import { GlobalTimelineFreeData } from "@models/globalBannerStats/entities/timeline/GlobalTimelineFreeData.js";
import { GlobalBannerData } from "@models/globalBannerStats/GlobalBannerData.js";
import { GlobalBannerDataType } from "@models/globalBannerStats/GlobalBannerDataType.js";
import { getMapList } from "@utils/collectionUtils.js";

class GlobalBannerStatsAggregator {
    public static readonly OROBERYL_COST_PER_PULL: number = 500;
    public static readonly ARSENAL_TICKETS_COST_PER_TENPULL: number = 1980;

    private readonly _database: Database;

    public constructor(database: Database) {
        this._database = database;
    }

    public static getOroberylCost(unfreePullsCount: number): number {
        return unfreePullsCount * this.OROBERYL_COST_PER_PULL;
    }

    public static getArsenalTicketsCost(unfreePullsCount: number): number {
        return Math.floor(unfreePullsCount / 10) * this.ARSENAL_TICKETS_COST_PER_TENPULL;
    }

    private static getGlobalItemStatData(record: GlobalItemStatsRecord, totalCount: number): GlobalItemStatData {
        return {
            itemId: record.itemId,
            count: record.count.initValue,
            rate: record.count.initValue / totalCount
        };
    }

    private static getGlobalPityDistributionData(record: GlobalPityDistributionRecord, totalCount: number): GlobalPityDistributionData {
        return {
            pity: record.pity,
            count: record.count.initValue,
            rate: record.count.initValue / totalCount
        };
    }

    private static getMedianPity(pityDistribution: GlobalPityDistributionData[], itemsCount: number): number {
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

    private static getFeaturedCount(banner: Banner, items: GlobalItemStatData[]): number {
        return items.reduce(
            (sum, item) => sum + (banner.isFeatured(item.itemId) ? item.count : 0),
            0
        );
    }

    public async getGlobalBannerData(bannerId: string): Promise<GlobalBannerData | null> {
        const banner = Banner.get(bannerId);

        if (!banner) {
            return null;
        }

        const globalType = banner.globalBannerDataType;

        switch (globalType) {
            case GlobalBannerDataType.BEGINNER: return await this.getGlobalBannerDataBeginner(banner);
            case GlobalBannerDataType.STANDARD: return await this.getGlobalBannerDataStandard(banner);
            case GlobalBannerDataType.SPECIAL_V1: return await this.getGlobalBannerDataSpecialV1(banner);
            case GlobalBannerDataType.SPECIAL_V2: return await this.getGlobalBannerDataSpecialV2(banner);
            case GlobalBannerDataType.JOINT_V1: return await this.getGlobalBannerDataJointV1(banner);
            case GlobalBannerDataType.JOINT_V2: return await this.getGlobalBannerDataJointV2(banner);
            case GlobalBannerDataType.WEAPON_V1: return await this.getGlobalBannerDataWeaponV1(banner);
            case GlobalBannerDataType.WEAPON_V2: return await this.getGlobalBannerDataWeaponV2(banner);
        }
    }

    private async getGlobalBannerDataBeginner(banner: Banner): Promise<GlobalBannerDataBeginner> {
        const bannerId = banner.id;
        const stats = await this._database.userBannerStats.getGlobalBannerStats(bannerId);

        if (stats.totalUsers === 0) {
            return {
                type: GlobalBannerDataType.BEGINNER,
                stats: {
                    overview: {
                        totalUsers: 0,
                        totalPulls: 0
                    },
                    stats6: {
                        medianPity: 0,
                        totalCount: 0,
                        totalRate: 0
                    },
                    stats5: {
                        totalCount: 0,
                        totalRate: 0
                    }
                },
                timeline: [],
                items5: [],
                pityDistribution6: [],
                items6: []
            };
        }

        const groupedPityDistribution = await this.getGroupedPityDistribution(bannerId, stats.total6);
        const groupedItems = await this.getGroupedItems(bannerId, stats.total6, stats.total5);
        const timeline = await this.getTimelineData(bannerId, stats.totalPulls);

        const pityDistribution6 = groupedPityDistribution.get(6) ?? [];

        return {
            type: GlobalBannerDataType.BEGINNER,
            stats: {
                overview: {
                    totalUsers: stats.totalUsers,
                    totalPulls: stats.totalPulls,
                },
                stats6: {
                    totalCount: stats.total6,
                    totalRate: stats.total6 / stats.totalPulls,
                    medianPity: GlobalBannerStatsAggregator.getMedianPity(pityDistribution6, stats.total6)
                },
                stats5: {
                    totalCount: stats.total5,
                    totalRate: stats.total5 / stats.totalPulls
                }
            },
            timeline,
            pityDistribution6,
            items6: groupedItems.get(6) ?? [],
            items5: groupedItems.get(5) ?? [],
        }
    }

    private async getGlobalBannerDataStandard(banner: Banner): Promise<GlobalBannerDataStandard> {
        const bannerId = banner.id;
        const stats = await this._database.userBannerStats.getGlobalBannerStats(bannerId);

        if (stats.totalUsers === 0) {
            return {
                type: GlobalBannerDataType.STANDARD,
                stats: {
                    overview: {
                        totalUsers: 0,
                        totalPulls: 0,
                        oroberylSpent: 0
                    },
                    stats5: {
                        totalCount: 0,
                        totalRate: 0
                    },
                    stats6: {
                        medianPity: 0,
                        totalRate: 0,
                        totalCount: 0
                    }
                },
                items5: [],
                items6: [],
                pityDistribution6: [],
                timeline: []
            };
        }

        const groupedPityDistribution = await this.getGroupedPityDistribution(bannerId, stats.total6);
        const groupedItems = await this.getGroupedItems(bannerId, stats.total6, stats.total5);
        const timeline = await this.getTimelineData(bannerId, stats.totalPulls);

        const pityDistribution6 = groupedPityDistribution.get(6) ?? [];

        return {
            type: GlobalBannerDataType.STANDARD,
            stats: {
                overview: {
                    totalUsers: stats.totalUsers,
                    totalPulls: stats.totalPulls,
                    oroberylSpent: GlobalBannerStatsAggregator.getOroberylCost(stats.totalPulls)
                },
                stats6: {
                    totalCount: stats.total6,
                    medianPity: GlobalBannerStatsAggregator.getMedianPity(pityDistribution6, stats.total6),
                    totalRate: stats.total6 / stats.totalPulls
                },
                stats5: {
                    totalCount: stats.total5,
                    totalRate: stats.total5 / stats.totalPulls
                }
            },
            timeline,
            pityDistribution6,
            items6: groupedItems.get(6) ?? [],
            items5: groupedItems.get(5) ?? []
        };
    }

    private async getGlobalBannerDataSpecialV1(banner: Banner): Promise<GlobalBannerDataSpecialV1> {
        const bannerId = banner.id;
        const stats = await this._database.userBannerStats.getGlobalBannerStats(bannerId);

        if (stats.totalUsers === 0) {
            return {
                type: GlobalBannerDataType.SPECIAL_V1,
                stats: {
                    featured: {
                        totalCount: 0,
                        ids: banner.getFeaturedList(),
                        guaranteedCount: 0
                    },
                    overview: {
                        totalUsers: 0,
                        oroberylSpent: 0,
                        totalPulls: 0,
                        freePulls: 0
                    },
                    stats6: {
                        totalCount: 0,
                        totalRate: 0,
                        medianPity: 0,
                        winrate: 0
                    },
                    stats5: {
                        totalCount: 0,
                        totalRate: 0
                    }
                },
                timeline: [],
                items5: [],
                items6: [],
                pityDistribution6: []
            };
        }

        const groupedPityDistribution = await this.getGroupedPityDistribution(bannerId, stats.total6);
        const groupedItems = await this.getGroupedItems(bannerId, stats.total6, stats.total5);
        const timeline = await this.getTimelineData(bannerId, stats.totalPulls);

        const pityDistribution6 = groupedPityDistribution.get(6) ?? [];

        return {
            type: GlobalBannerDataType.SPECIAL_V1,
            stats: {
                featured: {
                    totalCount: stats.featured,
                    guaranteedCount: stats.guaranteed,
                    ids: banner.getFeaturedList()
                },
                overview: {
                    totalUsers: stats.totalUsers,
                    totalPulls: stats.totalPulls,
                    freePulls: stats.freePulls,
                    oroberylSpent: GlobalBannerStatsAggregator.getOroberylCost(stats.unfreePulls)
                },
                stats6: {
                    totalCount: stats.total6,
                    totalRate: stats.total6 / stats.totalPulls,
                    medianPity: GlobalBannerStatsAggregator.getMedianPity(pityDistribution6, stats.total6),
                    winrate: stats.winrate
                },
                stats5: {
                    totalCount: stats.total5,
                    totalRate: stats.total5 / stats.totalPulls
                }
            },
            timeline,
            pityDistribution6,
            items6: groupedItems.get(6) ?? [],
            items5: groupedItems.get(5) ?? []
        };
    }

    private async getGlobalBannerDataSpecialV2(banner: Banner): Promise<GlobalBannerDataSpecialV2> {
        const bannerId = banner.id;
        const stats = await this._database.userBannerStats.getGlobalBannerStats(bannerId);

        if (stats.totalUsers === 0) {
            return {
                type: GlobalBannerDataType.SPECIAL_V2,
                stats: {
                    featured: {
                        totalCount: 0,
                        guaranteedCount: 0,
                        freeCount: 0,
                        ids: banner.getFeaturedList()
                    },
                    overview: {
                        totalUsers: 0,
                        oroberylSpent: 0,
                        freePulls: 0,
                        totalPulls: 0
                    },
                    stats6: {
                        totalCount: 0,
                        winrate: 0,
                        medianPity: 0,
                        totalRate: 0,
                        freeCount: 0,
                        freeRate: 0,
                        freeWinrate: 0
                    },
                    stats5: {
                        totalCount: 0,
                        totalRate: 0,
                        freeCount: 0,
                        freeRate: 0,
                        medianPity: 0
                    }
                },
                timeline: [],
                items5: [],
                items6: [],
                pityDistribution6: [],
                pityDistribution5: []
            };
        }

        const groupedPityDistribution = await this.getGroupedPityDistribution(bannerId, stats.total6, stats.total5);
        const groupedItems = await this.getGroupedItems(bannerId, stats.total6, stats.total5);
        const timeline = await this.getTimelineFreeData(bannerId, stats.totalPulls, stats.freePulls);

        const pityDistribution6 = groupedPityDistribution.get(6) ?? [];
        const pityDistribution5 = groupedPityDistribution.get(5) ?? [];

        return {
            type: GlobalBannerDataType.SPECIAL_V2,
            stats: {
                featured: {
                    totalCount: stats.featured,
                    guaranteedCount: stats.guaranteed,
                    freeCount: stats.freeWin5050,
                    ids: banner.getFeaturedList()
                },
                overview: {
                    totalUsers: stats.totalUsers,
                    totalPulls: stats.totalPulls,
                    freePulls: stats.freePulls,
                    oroberylSpent: GlobalBannerStatsAggregator.getOroberylCost(stats.unfreePulls)
                },
                stats6: {
                    totalCount: stats.total6,
                    totalRate: stats.total6 / stats.totalPulls,
                    medianPity: GlobalBannerStatsAggregator.getMedianPity(pityDistribution6, stats.unfree6),
                    winrate: stats.winrate,
                    freeCount: stats.free6,
                    freeRate: stats.free6 / stats.freePulls,
                    freeWinrate: stats.freeWinrate
                },
                stats5: {
                    totalCount: stats.total5,
                    totalRate: stats.total5 / stats.totalPulls,
                    medianPity: GlobalBannerStatsAggregator.getMedianPity(pityDistribution5, stats.unfree5),
                    freeCount: stats.free5,
                    freeRate: stats.free5 / stats.freePulls
                }
            },
            timeline,
            pityDistribution6,
            pityDistribution5,
            items6: groupedItems.get(6) ?? [],
            items5: groupedItems.get(5) ?? [],
        };
    }

    private async getGlobalBannerDataJointV1(banner: Banner): Promise<GlobalBannerDataJointV1> {
        const bannerId = banner.id;
        const stats = await this._database.userBannerStats.getGlobalBannerStats(bannerId);

        if (stats.totalUsers === 0) {
            return {
                type: GlobalBannerDataType.JOINT_V1,
                stats: {
                    featured: {
                        totalCount: 0,
                        ids: banner.getFeaturedList()
                    },
                    overview: {
                        totalUsers: 0,
                        oroberylSpent: 0,
                        freePulls: 0,
                        totalPulls: 0
                    },
                    stats5: {
                        totalCount: 0,
                        totalRate: 0
                    },
                    stats6: {
                        totalCount: 0,
                        winrate: 0,
                        medianPity: 0,
                        totalRate: 0
                    }
                },
                items6: [],
                items5: [],
                pityDistribution6: [],
                timeline: []
            };
        }

        const groupedPityDistribution = await this.getGroupedPityDistribution(bannerId, stats.total6);
        const groupedItems = await this.getGroupedItems(bannerId, stats.total6, stats.total5);
        const timeline = await this.getTimelineData(bannerId, stats.totalPulls);

        const pityDistribution6 = groupedPityDistribution.get(6) ?? [];

        const items6 = groupedItems.get(6) ?? [];
        const items5 = groupedItems.get(5) ?? [];

        return {
            type: GlobalBannerDataType.JOINT_V1,
            stats: {
                featured: {
                    totalCount: GlobalBannerStatsAggregator.getFeaturedCount(banner, items6),
                    ids: banner.getFeaturedList()
                },
                overview: {
                    totalUsers: stats.totalUsers,
                    totalPulls: stats.totalPulls,
                    freePulls: stats.freePulls,
                    oroberylSpent: GlobalBannerStatsAggregator.getOroberylCost(stats.unfreePulls)
                },
                stats6: {
                    totalCount: stats.total6,
                    totalRate: stats.total6 / stats.totalPulls,
                    medianPity: GlobalBannerStatsAggregator.getMedianPity(pityDistribution6, stats.total6),
                    winrate: stats.winrate
                },
                stats5: {
                    totalCount: stats.total5,
                    totalRate: stats.total5 / stats.totalPulls
                }
            },
            timeline,
            pityDistribution6,
            items6,
            items5
        };
    }

    private async getGlobalBannerDataJointV2(banner: Banner): Promise<GlobalBannerDataJointV2> {
        const bannerId = banner.id;
        const stats = await this._database.userBannerStats.getGlobalBannerStats(bannerId);

        if (stats.totalUsers === 0) {
            return {
                type: GlobalBannerDataType.JOINT_V2,
                stats: {
                    featured: {
                        totalCount: 0,
                        freeCount: 0,
                        ids: banner.getFeaturedList()
                    },
                    overview: {
                        totalUsers: 0,
                        oroberylSpent: 0,
                        freePulls: 0,
                        totalPulls: 0
                    },
                    stats6: {
                        totalCount: 0,
                        winrate: 0,
                        medianPity: 0,
                        totalRate: 0,
                        freeWinrate: 0,
                        freeRate: 0,
                        freeCount: 0
                    },
                    stats5: {
                        totalCount: 0,
                        totalRate: 0,
                        freeRate: 0,
                        freeCount: 0,
                        medianPity: 0
                    }
                },
                timeline: [],
                items5: [],
                items6: [],
                pityDistribution5: [],
                pityDistribution6: []
            };
        }

        const groupedPityDistribution = await this.getGroupedPityDistribution(bannerId, stats.total6, stats.total5);
        const groupedItems = await this.getGroupedItems(bannerId, stats.total6, stats.total5);
        const timeline = await this.getTimelineFreeData(bannerId, stats.totalPulls, stats.freePulls);

        const pityDistribution6 = groupedPityDistribution.get(6) ?? [];
        const pityDistribution5 = groupedPityDistribution.get(5) ?? [];

        return {
            type: GlobalBannerDataType.JOINT_V2,
            stats: {
                featured: {
                    totalCount: stats.featured,
                    freeCount: stats.freeWin5050,
                    ids: banner.getFeaturedList()
                },
                overview: {
                    totalUsers: stats.totalUsers,
                    totalPulls: stats.totalPulls,
                    freePulls: stats.freePulls,
                    oroberylSpent: GlobalBannerStatsAggregator.getOroberylCost(stats.unfreePulls)
                },
                stats6: {
                    totalCount: stats.total6,
                    totalRate: stats.total6 / stats.totalPulls,
                    medianPity: GlobalBannerStatsAggregator.getMedianPity(pityDistribution6, stats.unfree6),
                    winrate: stats.winrate,
                    freeCount: stats.free6,
                    freeRate: stats.free6 / stats.freePulls,
                    freeWinrate: stats.freeWinrate
                },
                stats5: {
                    totalCount: stats.total5,
                    totalRate: stats.total5 / stats.totalPulls,
                    medianPity: GlobalBannerStatsAggregator.getMedianPity(pityDistribution5, stats.unfree5),
                    freeCount: stats.free5,
                    freeRate: stats.free5 / stats.freePulls
                }
            },
            timeline,
            pityDistribution6,
            pityDistribution5,
            items6: groupedItems.get(6) ?? [],
            items5: groupedItems.get(5) ?? [],
        };
    }

    private async getGlobalBannerDataWeaponV1(banner: Banner): Promise<GlobalBannerDataWeaponV1> {
        const bannerId = banner.id;
        const stats = await this._database.userBannerStats.getGlobalBannerStats(bannerId);

        if (stats.totalUsers === 0) {
            return {
                type: GlobalBannerDataType.WEAPON_V1,
                stats: {
                    featured: {
                        totalCount: 0,
                        guaranteedCount: 0,
                        ids: banner.getFeaturedList()
                    },
                    overview: {
                        totalUsers: 0,
                        totalPulls: 0,
                        arsenalTicketsSpent: 0
                    },
                    stats6: {
                        totalCount: 0,
                        winrate: 0,
                        medianPity: 0,
                        totalRate: 0
                    },
                    stats5: {
                        totalCount: 0,
                        totalRate: 0
                    }
                },
                timeline: [],
                pityDistribution6: [],
                items5: [],
                items6: []
            };
        }

        const groupedPityDistribution = await this.getGroupedPityDistribution(bannerId, stats.total6);
        const groupedItems = await this.getGroupedItems(bannerId, stats.total6, stats.total5);
        const timeline = await this.getTimelineData(bannerId, stats.totalPulls);

        const pityDistribution6 = groupedPityDistribution.get(6) ?? [];

        return {
            type: GlobalBannerDataType.WEAPON_V1,
            stats: {
                featured: {
                    totalCount: stats.featured,
                    guaranteedCount: stats.guaranteed,
                    ids: banner.getFeaturedList()
                },
                overview: {
                    totalUsers: stats.totalUsers,
                    totalPulls: stats.totalPulls,
                    arsenalTicketsSpent: GlobalBannerStatsAggregator.getArsenalTicketsCost(stats.unfreePulls)
                },
                stats6: {
                    totalCount: stats.total6,
                    totalRate: stats.total6 / stats.totalPulls,
                    medianPity: GlobalBannerStatsAggregator.getMedianPity(pityDistribution6, stats.total6),
                    winrate: stats.winrate
                },
                stats5: {
                    totalCount: stats.total5,
                    totalRate: stats.total5 / stats.totalPulls
                }
            },
            timeline,
            pityDistribution6,
            items6: groupedItems.get(6) ?? [],
            items5: groupedItems.get(5) ?? [],
        };
    }

    private async getGlobalBannerDataWeaponV2(banner: Banner): Promise<GlobalBannerDataWeaponV2> {
        const bannerId = banner.id;
        const stats = await this._database.userBannerStats.getGlobalBannerStats(bannerId);

        if (stats.totalUsers === 0) {
            return {
                type: GlobalBannerDataType.WEAPON_V2,
                stats: {
                    featured: {
                        totalCount: 0,
                        guaranteedCount: 0,
                        ids: banner.getFeaturedList()
                    },
                    overview: {
                        totalUsers: 0,
                        arsenalTicketsSpent: 0,
                        totalPulls: 0
                    },
                    stats6: {
                        totalCount: 0,
                        medianPity: 0,
                        winrate: 0,
                        totalRate: 0
                    },
                    stats5: {
                        totalCount: 0,
                        totalRate: 0,
                        medianPity: 0
                    }
                },
                timeline: [],
                items5: [],
                items6: [],
                pityDistribution5: [],
                pityDistribution6: []
            };
        }

        const groupedPityDistribution = await this.getGroupedPityDistribution(bannerId, stats.total6, stats.total5);
        const groupedItems = await this.getGroupedItems(bannerId, stats.total6, stats.total5);
        const timeline = await this.getTimelineData(bannerId, stats.totalPulls);

        const pityDistribution6 = groupedPityDistribution.get(6) ?? [];
        const pityDistribution5 = groupedPityDistribution.get(5) ?? [];

        return {
            type: GlobalBannerDataType.WEAPON_V2,
            stats: {
                featured: {
                    totalCount: stats.featured,
                    guaranteedCount: stats.guaranteed,
                    ids: banner.getFeaturedList()
                },
                overview: {
                    totalUsers: stats.totalUsers,
                    totalPulls: stats.totalPulls,
                    arsenalTicketsSpent: GlobalBannerStatsAggregator.getArsenalTicketsCost(stats.unfreePulls)
                },
                stats6: {
                    totalCount: stats.total6,
                    totalRate: stats.total6 / stats.totalPulls,
                    winrate: stats.winrate,
                    medianPity: GlobalBannerStatsAggregator.getMedianPity(pityDistribution6, stats.unfree6)
                },
                stats5: {
                    totalCount: stats.total5,
                    totalRate: stats.total5 / stats.totalPulls,
                    medianPity: GlobalBannerStatsAggregator.getMedianPity(pityDistribution5, stats.unfree5)
                }
            },
            timeline,
            pityDistribution6,
            pityDistribution5,
            items6: groupedItems.get(6) ?? [],
            items5: groupedItems.get(5) ?? [],
        };
    }

    private async getGroupedPityDistribution(bannerId: string, total6: number, total5?: number): Promise<Map<number, GlobalPityDistributionData[]>> {
        const data = await this._database.globalBannerStats.getPityDistribution(bannerId);

        const map = getMapList(data, r => r.rarity);

        const result = new Map<number, GlobalPityDistributionData[]>();

        const list6: GlobalPityDistributionData[] = (map.get(6) ?? [])
            .map(r => GlobalBannerStatsAggregator.getGlobalPityDistributionData(r, total6));

        result.set(6, list6);

        if (total5 !== undefined) {
            const list5: GlobalPityDistributionData[] = (map.get(5) ?? [])
                .map(r => GlobalBannerStatsAggregator.getGlobalPityDistributionData(r, total5));

            result.set(5, list5);
        }

        return result;
    }

    private async getGroupedItems(bannerId: string, total6: number, total5?: number): Promise<Map<number, GlobalItemStatData[]>> {
        const data = await this._database.globalBannerStats.getItemStats(bannerId);

        const map = getMapList(data, r => r.rarity);

        const result = new Map<number, GlobalItemStatData[]>();

        const list6: GlobalItemStatData[] = (map.get(6) ?? [])
            .map(r => GlobalBannerStatsAggregator.getGlobalItemStatData(r, total6));

        result.set(6, list6);

        if (total5 !== undefined) {
            const list5: GlobalItemStatData[] = (map.get(5) ?? [])
                .map(r => GlobalBannerStatsAggregator.getGlobalItemStatData(r, total5));

            result.set(5, list5);
        }

        return result;
    }

    private async getTimelineData(bannerId: string, totalPulls: number): Promise<GlobalTimelineData[]> {
        const data = await this._database.globalBannerStats.getBannerTimeline(bannerId);

        return data.map(r => ({
            date: r.date,
            totalPulls: r.totalPullsCount.initValue,
            rate: r.totalPullsCount.initValue / totalPulls
        }));
    }

    private async getTimelineFreeData(bannerId: string, totalPulls: number, freePulls: number): Promise<(GlobalTimelineData & GlobalTimelineFreeData)[]> {
        const data = await this._database.globalBannerStats.getBannerTimeline(bannerId);

        return data.map(r => ({
            date: r.date,
            totalPulls: r.totalPullsCount.initValue,
            freePulls: r.totalPullsCount.initValue,
            rate: r.totalPullsCount.initValue / totalPulls,
            freeRate: r.freePullsCount.initValue / freePulls,
        }));
    }
}

export default GlobalBannerStatsAggregator;