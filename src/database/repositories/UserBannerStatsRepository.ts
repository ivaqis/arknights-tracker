import { UserBannerStatRecord } from "@database/records/UserBannerStatRecord";
import { UserCharBannerData } from "@database/repositories/interfaces/UserCharBannerData";
import { UserCharBannerTypeData } from "@database/repositories/interfaces/UserCharBannerTypeData";
import { UserWeaponBannerData } from "@database/repositories/interfaces/UserWeaponBannerData";
import { UserWeaponBannerTypeData } from "@database/repositories/interfaces/UserWeaponBannerTypeData";
import { Repository } from "@database/repositories/Repository";
import { UserBannerStatsTable } from "@database/tables/UserBannerStatsTable";
import { UserCharBannerPullsTable } from "@database/tables/UserCharBannerPullsTable";
import { UserCharBannerTypePullsTable } from "@database/tables/UserCharBannerTypePullsTable";
import { UserWeaponBannerPullsTable } from "@database/tables/UserWeaponBannerPullsTable";
import { DbBannerType } from "@models/banners/DbBannerType";
import { IncludeRange } from "@models/IncludeRange";
import { PrismaClient } from "@prisma/client";

export class UserBannerStatsRepository extends Repository {
    private readonly _userBannerStatsTable: UserBannerStatsTable;
    private readonly _userCharBannerTypePullsTable: UserCharBannerTypePullsTable;
    private readonly _userCharBannerPullsTable: UserCharBannerPullsTable;
    private readonly _userWeaponBannerPullsTable: UserWeaponBannerPullsTable;

    public constructor(prisma: PrismaClient) {
        super(prisma);

        this._userBannerStatsTable = new UserBannerStatsTable(prisma);
        this._userCharBannerTypePullsTable = new UserCharBannerTypePullsTable(prisma);
        this._userCharBannerPullsTable = new UserCharBannerPullsTable(prisma);
        this._userWeaponBannerPullsTable = new UserWeaponBannerPullsTable(prisma);
    }

    public async getCharBannerData(profileId: bigint, bannerId: string, bannerType: DbBannerType.CHAR): Promise<UserCharBannerData> {
        const bannerStat = await this._userBannerStatsTable.get(profileId, bannerId, bannerType);
        const bannerPulls = await this._userCharBannerPullsTable.get(profileId, bannerId);

        return {
            profileId,
            bannerId,
            stat: bannerStat,
            pulls: bannerPulls,
        };
    }

    public async getCharBannerTypeData(profileId: bigint,
                                       bannerType: DbBannerType.CHAR
    ): Promise<UserCharBannerTypeData> {
        const bannerTypePulls = await this._userCharBannerTypePullsTable.get(profileId, bannerType);
        const stat = await this._userBannerStatsTable.getTypeStats(profileId, bannerType);

        return {
            profileId,
            bannerType,
            stat: stat,
            pulls: bannerTypePulls
        };
    }

    public async updateCharBannerData(bannerData: UserCharBannerData) {
        await this._userBannerStatsTable.update(bannerData.stat);
        await this._userCharBannerPullsTable.update(bannerData.pulls);
    }

    public async updateCharBannerTypeData(data: UserCharBannerTypeData) {
        await this._userCharBannerTypePullsTable.update(data.pulls);
    }

    public async getWeaponBannerData(profileId: bigint, bannerId: string, bannerType: DbBannerType.WEAPON): Promise<UserWeaponBannerData> {
        const bannerStat = await this._userBannerStatsTable.get(profileId, bannerId, bannerType);
        const bannerPulls = await this._userWeaponBannerPullsTable.get(profileId, bannerId);

        return {
            profileId,
            bannerId,
            stat: bannerStat,
            pulls: bannerPulls
        };
    }

    public async getWeaponBannerTypeData(profileId: bigint,
                                         bannerType: DbBannerType.WEAPON
    ): Promise<UserWeaponBannerTypeData> {
        const stat = await this._userBannerStatsTable.getTypeStats(profileId, bannerType);

        return {
            profileId,
            bannerType,
            stat: stat
        };
    }

    public async updateWeaponBannerData(bannerData: UserWeaponBannerData) {
        await this._userBannerStatsTable.update(bannerData.stat);
        await this._userWeaponBannerPullsTable.update(bannerData.pulls);
    }

    public async getBannersStats(bannerId: string): Promise<UserBannerStatRecord[]> {
        return this._userBannerStatsTable.getAllByBannerId(bannerId);
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

    public async countTotalPullsByBannerType(bannerType: DbBannerType | null, pullsCount: IncludeRange = {}): Promise<number> {
        // return this._userBannerTypeStatsTable.countTotalPullsByBannerType(bannerType, pullsCount);
        return 0; // todo
    }

    public async countWinRateByBannerType(bannerType: DbBannerType | null, winRate: IncludeRange = {}): Promise<number> {
        // return this._userBannerTypeStatsTable.countWinRateByBannerType(bannerType, winRate);
        return 0; // todo
    }

    public async countLuck6ByBannerType(bannerType: DbBannerType | null, luckRate: IncludeRange = {}): Promise<number> {
        // return this._userBannerTypeStatsTable.countLuck6ByBannerType(bannerType, luckRate);
        return 0; // todo
    }

    public async countLuck5ByBannerType(bannerType: DbBannerType | null, luckRate: IncludeRange = {}): Promise<number> {
        // return this._userBannerTypeStatsTable.countLuck5ByBannerType(bannerType, luckRate);
        return 0; // todo
    }
}