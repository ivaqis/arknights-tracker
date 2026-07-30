import { UserBannerStatRecord } from "@database/records/UserBannerStatRecord";
import { UserBannerTypeStatRecord } from "@database/records/UserBannerTypeStatRecord";
import { UserCharBannerData } from "@database/repositories/interfaces/UserCharBannerData";
import { UserCharBannerTypeData } from "@database/repositories/interfaces/UserCharBannerTypeData";
import { UserWeaponBannerData } from "@database/repositories/interfaces/UserWeaponBannerData";
import { UserWeaponBannerTypeData } from "@database/repositories/interfaces/UserWeaponBannerTypeData";
import { Repository } from "@database/repositories/Repository";
import { UserBannerStatsTable } from "@database/tables/UserBannerStatsTable";
import { UserBannerTypeStatsTable } from "@database/tables/UserBannerTypeStatsTable";
import { UserCharBannerPullsTable } from "@database/tables/UserCharBannerPullsTable";
import { UserCharBannerTypePullsTable } from "@database/tables/UserCharBannerTypePullsTable";
import { UserWeaponBannerPullsTable } from "@database/tables/UserWeaponBannerPullsTable";
import { DbBannerType } from "@models/banners/DbBannerType";
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

    public async getCharBannerData(profileId: bigint, bannerId: string): Promise<UserCharBannerData> {
        const bannerStat = await this._userBannerStatsTable.get(profileId, bannerId);
        const bannerPulls = await this._userCharBannerPullsTable.get(profileId, bannerId);

        return {
            profileId,
            bannerId,
            stat: bannerStat,
            pulls: bannerPulls,
        };
    }

    public async getCharBannerTypeData(profileId: bigint,
                                       bannerType:
                                           | DbBannerType.CHAR_BEGINNER
                                           | DbBannerType.CHAR_STANDARD
                                           | DbBannerType.CHAR_SPECIAL
                                           | DbBannerType.CHAR_JOINT
    ): Promise<UserCharBannerTypeData> {
        const bannerTypeStat = await this._userBannerTypeStatsTable.get(profileId, bannerType);
        const bannerTypePulls = await this._userCharBannerTypePullsTable.get(profileId, bannerType);

        return {
            profileId,
            bannerType,
            stat: bannerTypeStat,
            pulls: bannerTypePulls
        };
    }

    public async updateCharBannerData(bannerData: UserCharBannerData) {
        await this._userBannerStatsTable.update(bannerData.stat);
        await this._userCharBannerPullsTable.update(bannerData.pulls);
    }

    public async updateCharBannerTypeData(data: UserCharBannerTypeData) {
        await this._userBannerTypeStatsTable.update(data.stat);
        await this._userCharBannerTypePullsTable.update(data.pulls);
    }

    public async getWeaponBannerData(profileId: bigint, bannerId: string): Promise<UserWeaponBannerData> {
        const bannerStat = await this._userBannerStatsTable.get(profileId, bannerId);
        const bannerPulls = await this._userWeaponBannerPullsTable.get(profileId, bannerId);

        return {
            profileId,
            bannerId,
            stat: bannerStat,
            pulls: bannerPulls
        };
    }

    public async getWeaponBannerTypeData(profileId: bigint,
                                         bannerType:
                                             | DbBannerType.WEAPON_SPECIAL
                                             | DbBannerType.WEAPON_STANDARD
    ): Promise<UserWeaponBannerTypeData> {
        const bannerTypeStat = await this._userBannerTypeStatsTable.get(profileId, bannerType);

        return {
            profileId,
            bannerType,
            stat: bannerTypeStat
        };
    }

    public async updateWeaponBannerData(bannerData: UserWeaponBannerData) {
        await this._userBannerStatsTable.update(bannerData.stat);
        await this._userWeaponBannerPullsTable.update(bannerData.pulls);
    }

    public async updateWeaponBannerTypeData(data: UserWeaponBannerTypeData) {
        await this._userBannerTypeStatsTable.update(data.stat);
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