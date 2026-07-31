import { Database } from "@database/Database";
import { GlobalBannerStatsRecord } from "@database/records/GlobalBannerStatsRecord";
import { GlobalBannerTimelineRecord } from "@database/records/GlobalBannerTimelineRecord";
import { GlobalItemStatsRecord } from "@database/records/GlobalItemStatsRecord";
import { GlobalPityDistributionRecord } from "@database/records/GlobalPityDistributionRecord";
import { UserCharBannerData } from "@database/repositories/interfaces/UserCharBannerData";
import { UserCharBannerTypeData } from "@database/repositories/interfaces/UserCharBannerTypeData";
import { UserWeaponBannerData } from "@database/repositories/interfaces/UserWeaponBannerData";
import { UserWeaponBannerTypeData } from "@database/repositories/interfaces/UserWeaponBannerTypeData";
import { Banner } from "@models/banners/Banner";
import { DbBannerType } from "@models/banners/DbBannerType";
import { BannersPulls } from "@models/pulls/BannersPulls";
import { CharPull } from "@models/pulls/CharPull";
import { WeaponPull } from "@models/pulls/WeaponPull";
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

    private static isFeatured(bannerId: string, itemId: string): boolean {
        const banner = Banner.get(bannerId);

        if (!banner) {
            throw new Error(`Banner id not found: ${bannerId}`);
        }

        return banner.isFeatured(itemId);
    }


    public async execute(): Promise<void> {
        await this.updateCharPulls(DbBannerType.CHAR_SPECIAL, this._pulls.specialPulls);
        await this.updateCharPulls(DbBannerType.CHAR_JOINT, this._pulls.jointPulls);
        await this.updateCharPulls(DbBannerType.CHAR_BEGINNER, this._pulls.beginnerPulls);
        await this.updateCharPulls(DbBannerType.CHAR_STANDARD, this._pulls.standardPulls);
        await this.updateWeaponPulls(this._pulls.weaponPulls);

        await this.writeData();
    }

    private async updateCharPulls(bannerType: DbBannerType.CHAR, pulls: CharPull[]): Promise<void> {
        for (const pull of pulls) {
            await this.updateCharPull(bannerType, pull);
        }
    }

    private async updateCharPull(bannerType: DbBannerType.CHAR, pull: CharPull): Promise<void> {
        const bannerId = pull.bannerId;
        const ts = pull.gachaTsNumber;

        const bannerTypeData = await this.getCharBannerTypeData(bannerType);

        if (ts <= bannerTypeData.pulls.lastPullTimeTs.initValue) {
            return;
        }

        const bannerData = await this.getCharBannerData(bannerId);
        // const globalStats = await this.getGlobalBannerStats(bannerId);
        const timeline = await this.getTimelineRecord(bannerId, TimelineDate.createFromTs(ts));
        const item = await this.getItemStatRecord(bannerId, pull.charId, pull.rarity);

        bannerTypeData.pulls.lastPullTimeTs.value = pull.gachaTsBigint;

        timeline.totalPullsCount.value++;

        item.count.value++;

        if (pull.isFree) {
            bannerData.stat.freePulls.value++;
            bannerTypeData.stat.freePulls.value++;
            timeline.freePullsCount.value++;

            if (pull.rarity === 5 || pull.rarity === 6) {
                const pityRecord = await this.getPityDistributionRecord(bannerId, 0, pull.rarity);
                pityRecord.count.value++;
            }

            if (pull.rarity === 5) {
                bannerData.stat.free5.value++;
                bannerData.stat.total5.value++;

                bannerTypeData.stat.free5.value++;
                bannerTypeData.stat.total5.value++;

            } else if (pull.rarity === 6) {
                bannerData.stat.free6.value++;
                bannerData.stat.total6.value++;
                bannerData.stat.total5050.value++;

                bannerTypeData.stat.free6.value++;
                bannerTypeData.stat.total6.value++;
                bannerTypeData.stat.total5050.value++;

                if (UserPullsUpdater.isFeatured(bannerId, pull.charId)) {
                    bannerData.stat.freeWin5050.value++;
                    bannerData.stat.won5050.value++;

                    bannerTypeData.stat.freeWin5050.value++;
                    bannerTypeData.stat.won5050.value++;
                }
            }

            return;
        }

        bannerData.stat.unfreePulls.value++;
        bannerTypeData.stat.unfreePulls.value++;

        if (pull.rarity === 5) {
            bannerData.stat.total5.value++;

            bannerTypeData.stat.total5.value++;

            const pity = bannerTypeData.stat.unfreePulls.value - bannerTypeData.pulls.last5Pull.value;
            const pityRecord = await this.getPityDistributionRecord(bannerId, pity, 5);
            pityRecord.count.value++;

            bannerTypeData.pulls.last5Pull.value = bannerTypeData.stat.unfreePulls.value;

        } else if (pull.rarity === 6) {
            bannerData.stat.total6.value++;

            bannerTypeData.stat.total6.value++;

            const pity = bannerTypeData.stat.unfreePulls.value - bannerTypeData.pulls.last6Pull.value;
            const pityRecord = await this.getPityDistributionRecord(bannerId, pity, 6);
            pityRecord.count.value++;

            bannerTypeData.pulls.last6Pull.value = bannerTypeData.stat.unfreePulls.value;

            const isFeatured = UserPullsUpdater.isFeatured(bannerId, pull.charId);
            const isGuaranteed = isFeatured
                ? (bannerData.pulls.last6LimitedPull.value === 0
                    && bannerData.stat.unfreePulls.value === 120)
                : false;

            if (isFeatured) {
                bannerData.pulls.last6LimitedPull.value = bannerData.stat.unfreePulls.value;

                if (!isGuaranteed) {
                    bannerData.stat.total5050.value++;
                    bannerData.stat.won5050.value++;

                    bannerTypeData.stat.total5050.value++;
                    bannerTypeData.stat.won5050.value++;

                    bannerTypeData.pulls.lastWin5050Pull.value = bannerTypeData.stat.unfreePulls.value;
                }
            } else {
                bannerData.stat.total5050.value++;

                bannerTypeData.stat.total5050.value++;
            }
        }
    }

    private async updateWeaponPulls(pulls: WeaponPull[]) {
        for (const pull of pulls) {
            await this.updateWeaponPull(pull);
        }
    }

    private async updateWeaponPull(pull: WeaponPull): Promise<void> {
        const bannerId = pull.bannerId;
        const ts = pull.gachaTsNumber;

        const bannerData = await this.getWeaponBannerData(bannerId);

        if (ts <= bannerData.pulls.lastPullTimeTs.initValue) {
            return;
        }

        const banner = Banner.get(bannerId);

        if (!banner) {
            throw new Error(`Banner id not found: ${bannerId}`);
        }

        const bannerType = banner.dbType as DbBannerType.WEAPON;

        const bannerTypeData = await this.getWeaponBannerTypeData(bannerType);
        const timeline = await this.getTimelineRecord(bannerId, TimelineDate.createFromTs(ts));
        const item = await this.getItemStatRecord(bannerId, pull.weaponId, pull.rarity);

        bannerData.pulls.lastPullTimeTs.value = pull.gachaTsBigint;

        timeline.totalPullsCount.value++;

        item.count.value++;

        bannerData.stat.unfreePulls.value++;
        bannerTypeData.stat.unfreePulls.value++;

        if (pull.rarity === 5) {
            bannerData.stat.total5.value++;

            bannerTypeData.stat.total5.value++;

            const pity = bannerData.stat.unfreePulls.value - bannerData.pulls.last5Pull.value;
            const pityRecord = await this.getPityDistributionRecord(bannerId, pity, 5);
            pityRecord.count.value++;

            bannerData.pulls.last5Pull.value = bannerData.stat.unfreePulls.value;

        } else if (pull.rarity === 6) {
            bannerData.stat.total6.value++;

            bannerTypeData.stat.total6.value++;

            const pity = bannerData.stat.unfreePulls.value - bannerData.pulls.last6Pull.value;
            const pityRecord = await this.getPityDistributionRecord(bannerId, pity, 6);
            pityRecord.count.value++;

            bannerData.pulls.last6Pull.value = bannerData.stat.unfreePulls.value;

            const isFeatured = UserPullsUpdater.isFeatured(bannerId, pull.weaponId);
            const isGuaranteed = isFeatured
                ? (bannerData.pulls.lastWin5050Pull.value === 0
                    && 70 <= bannerData.stat.unfreePulls.value && bannerData.stat.unfreePulls.value <= 80)
                : false;

            if (isFeatured) {
                bannerData.pulls.lastWin5050Pull.value = bannerData.stat.unfreePulls.value;

                if (!isGuaranteed) {
                    bannerData.stat.total5050.value++;
                    bannerData.stat.won5050.value++;

                    bannerTypeData.stat.total5050.value++;
                    bannerTypeData.stat.won5050.value++;
                }
            } else {
                bannerData.stat.total5050.value++;

                bannerTypeData.stat.total5050.value++;
            }
        }
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

    private async getItemStatRecord(bannerId: string, itemId: string, rarity: number): Promise<GlobalItemStatsRecord> {
        const index: ItemStatIndex = {
            bannerId,
            itemId
        };

        let result = this._itemStatMap.get(index);

        if (!result) {
            result = await this._database.globalBannerStats.getItemStatsRecord(bannerId, itemId, rarity);

            this._itemStatMap.set(index, result);
        }

        return result;
    }

    private async writeData(): Promise<void> {
        await this.writeCharBannerData();
        await this.writeCharBannerTypeData();
        await this.writeWeaponBannerData();
        await this.writeWeaponBannerTypeData();
        await this.writeTimelineData();
        await this.writePityDistributionData();
        await this.writeItemStatData();
    }

    private async writeCharBannerData() {
        for (const data of this._charBannerMap.values()) {
            await this._database.userBannerStats.updateCharBannerData(data);
        }
    }

    private async writeCharBannerTypeData() {
        for (const data of this._charBannerTypeMap.values()) {
            await this._database.userBannerStats.updateCharBannerTypeData(data);
        }
    }

    private async writeWeaponBannerData() {
        for (const data of this._weaponBannerMap.values()) {
            await this._database.userBannerStats.updateWeaponBannerData(data);
        }
    }

    private async writeWeaponBannerTypeData() {
        for (const data of this._weaponBannerTypeMap.values()) {
            await this._database.userBannerStats.updateWeaponBannerTypeData(data);
        }
    }

    private async writeTimelineData() {
        for (const data of this._timelineMap.values()) {
            await this._database.globalBannerStats.updateBannerTimelineRecord(data);
        }
    }

    private async writePityDistributionData() {
        for (const data of this._pityDistributionMap.values()) {
            await this._database.globalBannerStats.updatePityDistributionRecord(data);
        }
    }

    private async writeItemStatData() {
        for (const data of this._itemStatMap.values()) {
            await this._database.globalBannerStats.updateItemStatsRecord(data);
        }
    }
}