import { Database } from "@database/Database";
import { GlobalBannerStatsRecord } from "@database/records/GlobalBannerStatsRecord";
import { GlobalBannerTimelineRecord } from "@database/records/GlobalBannerTimelineRecord";
import { GlobalItemStatsRecord } from "@database/records/GlobalItemStatsRecord";
import { GlobalPityDistributionRecord } from "@database/records/GlobalPityDistributionRecord";
import { UserCharBannerData } from "@database/repositories/interfaces/UserCharBannerData";
import { UserCharBannerTypeData } from "@database/repositories/interfaces/UserCharBannerTypeData";
import { UserWeaponBannerData } from "@database/repositories/interfaces/UserWeaponBannerData";
import { UserWeaponBannerTypeData } from "@database/repositories/interfaces/UserWeaponBannerTypeData";
import { DbBannerType } from "@models/banners/DbBannerType";
import { BannersPulls } from "@models/pulls/BannersPulls";
import { CharPull } from "@models/pulls/CharPull";
import { ItemStatIndex } from "@models/pullsAggregator/ItemStatIndex";
import { PityDistributionIndex } from "@models/pullsAggregator/PityDistributionIndex";
import { TimelineIndex } from "@models/pullsAggregator/TimelineIndex";
import { TimelineDate } from "@models/TimelineDate";

export class UserPullsUpdater {
    private readonly _database: Database;

    private readonly _charBannerMap: Map<string, UserCharBannerData> = new Map();
    private readonly _charBannerTypeMap: Map<string, UserCharBannerTypeData> = new Map();
    private readonly _weaponBannerMap: Map<string, UserWeaponBannerData> = new Map();
    private readonly _weaponBannerTypeMap: Map<string, UserWeaponBannerTypeData> = new Map();
    private readonly _globalBannerMap: Map<string, GlobalBannerStatsRecord> = new Map();
    private readonly _timelineMap: Map<TimelineIndex, GlobalBannerTimelineRecord> = new Map();
    private readonly _pityDistributionMap: Map<PityDistributionIndex, GlobalPityDistributionRecord> = new Map();
    private readonly _itemStatMap: Map<ItemStatIndex, GlobalItemStatsRecord> = new Map();

    private readonly _profileId: bigint;
    private readonly _pulls: BannersPulls;

    public constructor(database: Database, profileId: bigint, pulls: BannersPulls) {
        this._database = database;
        this._profileId = profileId;
        this._pulls = pulls;
    }

    public async execute(): Promise<void> {

    }

    private async updateCharPulls(bannerType: DbBannerType.CHAR, pulls: CharPull[]) {
        for (const pull of pulls) {

        }
    }

    private async updateCharPull(bannerType: DbBannerType.CHAR, pull: CharPull): Promise<void> {
        const bannerId = pull.bannerId;
        const ts = pull.gachaTsNumber;

        const bannerData = await this.getCharBannerData(bannerId);
        const bannerTypeData = await this.getCharBannerTypeData(bannerType);
        const globalStats = await this.getGlobalBannerStats(bannerId);
        const timeline = await this.getTimelineRecord(bannerId, TimelineDate.createFromTs(ts));
        const item = await this.getItemStatRecord(bannerId, pull.charId);


    }

    private async getCharBannerData(bannerId: string): Promise<UserCharBannerData> {
        let result = this._charBannerMap.get(bannerId);

        if (!result) {
            result = await this._database.userBannerStats.getCharBannerData(this._profileId, bannerId);

            this._charBannerMap.set(bannerId, result);
        }

        return result;
    }

    private async getCharBannerTypeData(bannerType: DbBannerType.CHAR): Promise<UserCharBannerTypeData> {
        let result = this._charBannerTypeMap.get(bannerType);

        if (!result) {
            result = await this._database.userBannerStats.getCharBannerTypeData(this._profileId, bannerType);

            this._charBannerTypeMap.set(bannerType, result);
        }

        return result;
    }

    private async getWeaponBannerData(bannerId: string): Promise<UserWeaponBannerData> {
        let result = this._weaponBannerMap.get(bannerId);

        if (!result) {
            result = await this._database.userBannerStats.getWeaponBannerData(this._profileId, bannerId);

            this._weaponBannerMap.set(bannerId, result);
        }

        return result;
    }

    private async getWeaponBannerTypeData(bannerType: DbBannerType.WEAPON): Promise<UserWeaponBannerTypeData> {
        let result = this._weaponBannerTypeMap.get(bannerType);

        if (!result) {
            result = await this._database.userBannerStats.getWeaponBannerTypeData(this._profileId, bannerType);

            this._weaponBannerTypeMap.set(bannerType, result);
        }

        return result;
    }

    private async getGlobalBannerStats(bannerId: string): Promise<GlobalBannerStatsRecord> {
        let result = this._globalBannerMap.get(bannerId);

        if (!result) {
            result = await this._database.globalBannerStats.getBannerStats(bannerId);

            this._globalBannerMap.set(bannerId, result);
        }

        return result;
    }

    private async getTimelineRecord(bannerId: string, date: TimelineDate): Promise<GlobalBannerTimelineRecord> {
        const dateString = date.toString();
        const index: TimelineIndex = {
            bannerId,
            date: dateString
        };

        let result = this._timelineMap.get(index);

        if (!result) {
            result = await this._database.globalBannerStats.getBannerTimelineRecord(bannerId, dateString);

            this._timelineMap.set(index, result);
        }

        return result;
    }

    private async getPityDistributionRecord(bannerId: string, pity: number, rarity: number): Promise<GlobalPityDistributionRecord> {
        const index: PityDistributionIndex = {
            bannerId,
            pity,
            rarity
        };

        let result = this._pityDistributionMap.get(index);

        if (!result) {
            result = await this._database.globalBannerStats.getPityDistributionRecord(bannerId, pity, rarity);

            this._pityDistributionMap.set(index, result);
        }

        return result;
    }

    private async getItemStatRecord(bannerId: string, itemId: string): Promise<GlobalItemStatsRecord> {
        const index: ItemStatIndex = {
            bannerId,
            itemId
        };

        let result = this._itemStatMap.get(index);

        if (!result) {
            result = await this._database.globalBannerStats.getItemStatsRecord(bannerId, itemId);

            this._itemStatMap.set(index, result);
        }

        return result;
    }
}