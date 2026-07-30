import { UserBannerStatRecord } from "@database/records/UserBannerStatRecord";
import { UserBannerTypeStatRecord } from "@database/records/UserBannerTypeStatRecord";
import { UserCharBannerData } from "@database/repositories/interfaces/UserCharBannerData";
import { UserWeaponBannerData } from "@database/repositories/interfaces/UserWeaponBannerData";
import { Repository } from "@database/repositories/Repository";
import { UserBannerStatsTable } from "@database/tables/UserBannerStatsTable";
import { UserBannerTypeStatsTable } from "@database/tables/UserBannerTypeStatsTable";
import { UserCharBannerPullsTable } from "@database/tables/UserCharBannerPullsTable";
import { UserCharBannerTypePullsTable } from "@database/tables/UserCharBannerTypePullsTable";
import { UserWeaponBannerPullsTable } from "@database/tables/UserWeaponBannerPullsTable";
import { Banner } from "@models/banners/Banner";
import { PrismaClient } from "@prisma/client";

export class UserBannerStatsRepository extends Repository {
    private readonly _userBannerStatsTable: UserBannerStatsTable;
    private readonly _userBannerTypeStatsTable: UserBannerTypeStatsTable;
    private readonly _userCharBannerTypePullsTable: UserCharBannerTypePullsTable;
    private readonly _userCharBannerPullsTable: UserCharBannerPullsTable;
    private readonly _userWeaponBannerPullsTable: UserWeaponBannerPullsTable;

    public constructor(prisma: PrismaClient) {
        super(prisma);

        this._userBannerStatsTable = new UserBannerStatsTable(prisma);
        this._userBannerTypeStatsTable = new UserBannerTypeStatsTable(prisma);
        this._userCharBannerTypePullsTable = new UserCharBannerTypePullsTable(prisma);
        this._userCharBannerPullsTable = new UserCharBannerPullsTable(prisma);
        this._userWeaponBannerPullsTable = new UserWeaponBannerPullsTable(prisma);
    }

    public async getCharBannerData(profileId: bigint, bannerId: string): Promise<UserCharBannerData | null> {
        const bannerType = Banner.get(bannerId)?.dbType;

        if (!bannerType) {
            return null;
        }

        // todo оптимизировать
        const bannerStat = await this._userBannerStatsTable.get(profileId, bannerId);
        const bannerTypeStat = await this._userBannerTypeStatsTable.get(profileId, bannerType);
        const bannerPulls = await this._userCharBannerPullsTable.get(profileId, bannerId);
        const bannerTypePulls = await this._userCharBannerTypePullsTable.get(profileId, bannerType);

        return {
            bannerStat,
            bannerTypeStat,
            bannerPulls,
            bannerTypePulls
        };
    }

    public async updateCharBannerData(bannerData: UserCharBannerData) {
        await this._userBannerStatsTable.update(bannerData.bannerStat);
        await this._userBannerTypeStatsTable.update(bannerData.bannerTypeStat);
        await this._userCharBannerPullsTable.update(bannerData.bannerPulls);
        await this._userCharBannerTypePullsTable.update(bannerData.bannerTypePulls);
    }

    public async getWeaponBannerData(profileId: bigint, bannerId: string): Promise<UserWeaponBannerData | null> {
        const bannerType = Banner.get(bannerId)?.dbType;

        if (!bannerType) {
            return null;
        }

        const bannerStat = await this._userBannerStatsTable.get(profileId, bannerId);
        const bannerTypeStat = await this._userBannerTypeStatsTable.get(profileId, bannerType);
        const bannerPulls = await this._userWeaponBannerPullsTable.get(profileId, bannerId);

        return {
            bannerStat,
            bannerTypeStat,
            bannerPulls
        };
    }

    public async updateWeaponBannerData(bannerData: UserWeaponBannerData) {
        await this._userBannerStatsTable.update(bannerData.bannerStat);
        await this._userBannerTypeStatsTable.update(bannerData.bannerTypeStat);
        await this._userWeaponBannerPullsTable.update(bannerData.bannerPulls);
    }

    public async getBannersStats(bannerId: string): Promise<UserBannerStatRecord[]> {
        return this._userBannerStatsTable.getAllByBannerId(bannerId);
    }

    public async getBannerTypeStats(bannerType: string): Promise<UserBannerTypeStatRecord[]> {
        return this._userBannerTypeStatsTable.getAllByBannerId(bannerType);
    }

    public async getLastPullTimeTs(profileId: bigint): Promise<bigint | null> {
        const lastChar = await this._userCharBannerTypePullsTable.getLastPullTs(profileId);
        const lastWeapon = await this._userWeaponBannerPullsTable.getLastPullTimeTs(profileId);

        if (lastChar === null && lastWeapon === null) {
            return null;
        }

        if (lastChar === null) {
            return lastWeapon;
        }

        if (lastWeapon === null) {
            return lastChar;
        }

        return lastChar > lastWeapon ? lastChar : lastWeapon;
    }
}