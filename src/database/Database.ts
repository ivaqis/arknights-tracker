import { GeneratedTokensTable } from "@database/tables/GeneratedTokensTable";
import { GlobalBannerStatsTable } from "@database/tables/GlobalBannerStatsTable";
import { GlobalBannerTimelinesTable } from "@database/tables/GlobalBannerTimelinesTable";
import { GlobalItemStatsTable } from "@database/tables/GlobalItemStatsTable";
import { GlobalPityDistributionsTable } from "@database/tables/GlobalPityDistributionsTable";
import { ImportErrorsTable } from "@database/tables/ImportErrorsTable";
import { UserBannerStatsTable } from "@database/tables/UserBannerStatsTable";
import { UserBannerTypeStatsTable } from "@database/tables/UserBannerTypeStatsTable";
import { UserCharBannerPullsTable } from "@database/tables/UserCharBannerPullsTable";
import { UserCharBannerTypePullsTable } from "@database/tables/UserCharBannerTypePullsTable";
import { UserBannerProfilesTable } from "@database/tables/UserBannerProfilesTable";
import { UserWeaponBannerPullsTable } from "@database/tables/UserWeaponBannerPullsTable";
import { PrismaClient } from "@prisma/client";

export class Database {
    private readonly _prisma: PrismaClient;

    private readonly _userBannerProfilesRepository: UserBannerProfilesTable;
    private readonly _generatedTokensRepository: GeneratedTokensTable;
    private readonly _userBannerStatsRepository: UserBannerStatsTable;
    private readonly _userBannerTypeStatsRepository: UserBannerTypeStatsTable;
    private readonly _userCharBannerTypePullsRepository: UserCharBannerTypePullsTable;
    private readonly _userCharBannerPullsRepository: UserCharBannerPullsTable;
    private readonly _userWeaponBannerPullsRepository: UserWeaponBannerPullsTable;
    private readonly _globalBannerStatsRepository: GlobalBannerStatsTable;
    private readonly _globalBannerTimelinesRepository: GlobalBannerTimelinesTable;
    private readonly _globalPityDistributionsRepository: GlobalPityDistributionsTable;
    private readonly _globalItemStatsRepository: GlobalItemStatsTable;
    private readonly _importErrorsRepository: ImportErrorsTable;

    public constructor(prisma: PrismaClient) {
        const isValid = Database.isPrismaValid(prisma);

        if (!isValid) {
            throw new Error("Invalid prisma client");
        }

        this._prisma = prisma;

        this._userBannerProfilesRepository = new UserBannerProfilesTable(prisma);
        this._generatedTokensRepository = new GeneratedTokensTable(prisma);
        this._userBannerStatsRepository = new UserBannerStatsTable(prisma);
        this._userBannerTypeStatsRepository = new UserBannerTypeStatsTable(prisma);
        this._userCharBannerTypePullsRepository = new UserCharBannerTypePullsTable(prisma);
        this._userCharBannerPullsRepository = new UserCharBannerPullsTable(prisma);
        this._userWeaponBannerPullsRepository = new UserWeaponBannerPullsTable(prisma);
        this._globalBannerStatsRepository = new GlobalBannerStatsTable(prisma);
        this._globalBannerTimelinesRepository = new GlobalBannerTimelinesTable(prisma);
        this._globalPityDistributionsRepository = new GlobalPityDistributionsTable(prisma);
        this._globalItemStatsRepository = new GlobalItemStatsTable(prisma);
        this._importErrorsRepository = new ImportErrorsTable(prisma);
    }

    private static isPrismaValid(prisma: PrismaClient): boolean {
        return Boolean(
            prisma
            && prisma.userBannerProfile
            && prisma.generatedToken
            && prisma.userBannerStat
            && prisma.userBannerTypeStat
            && prisma.userCharBannerPulls
            && prisma.userCharBannerTypePulls
            && prisma.userWeaponBannerPulls
            && prisma.globalBannerStats
            && prisma.globalBannerTimeline
            && prisma.globalPityDistribution
            && prisma.globalItemStats
            && prisma.importError
        );
    }
}