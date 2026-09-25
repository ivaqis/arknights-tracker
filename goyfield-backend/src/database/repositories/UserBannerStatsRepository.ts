import { GlobalBannerStatsEntity } from "@database/entities/GlobalBannerStatsEntity.js";
import { UserBannerTypeStatEntity } from "@database/entities/UserBannerTypeStatEntity.js";
import { UserBannerStatRecord } from "@database/records/UserBannerStatRecord.js";
import { UserCharBannerData } from "@database/repositories/interfaces/UserCharBannerData.js";
import { UserCharBannerTypeData } from "@database/repositories/interfaces/UserCharBannerTypeData.js";
import { UserWeaponBannerData } from "@database/repositories/interfaces/UserWeaponBannerData.js";
import { UserWeaponBannerTypeData } from "@database/repositories/interfaces/UserWeaponBannerTypeData.js";
import { Repository } from "@database/repositories/Repository.js";
import { UserBannerStatsTable } from "@database/tables/UserBannerStatsTable.js";
import { UserCharBannerPullsTable } from "@database/tables/UserCharBannerPullsTable.js";
import { UserCharBannerTypePullsTable } from "@database/tables/UserCharBannerTypePullsTable.js";
import { UserWeaponBannerPullsTable } from "@database/tables/UserWeaponBannerPullsTable.js";
import { PrismaClient } from "@generated/prisma-v2/index.js";
import { DbBannerType } from "@models/banners/DbBannerType.js";
import { GlobalBannerStats } from "@models/globalBannerStats/GlobalBannerStats.js";
import { IncludeRange } from "@models/IncludeRange.js";

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

    public async getBannerTypeStats(profileId: bigint, bannerType: DbBannerType): Promise<UserBannerTypeStatEntity> {
        return this._userBannerStatsTable.getTypeStats(profileId, bannerType);
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

    public async getRatingStats(bannerType: DbBannerType | null,
                                totalPulls: number,
                                total6Count: number,
                                total5Count: number,
                                total5050Count: number,
                                won5050Count: number
    ): Promise<{
        totalUsers: number;
        gteTotalPulls: number;
        lteTotalPulls: number;
        gteLuck6Ratio: number;
        lteLuck6Ratio: number;
        gteLuck5Ratio: number;
        lteLuck5Ratio: number;
        total5050Users: number;
        gteWin5050Ratio: number;
        lteWin5050Ratio: number
    }> {
        return this._userBannerStatsTable.getRatingStats(bannerType, totalPulls, total6Count, total5Count, total5050Count, won5050Count);
    }

    public async getGlobalBannerStats(bannerId: string): Promise<GlobalBannerStats> {
        const entity = await this._userBannerStatsTable.getGlobalBannerStats(bannerId);

        return GlobalBannerStats.createFromEntity(entity);
    }
}