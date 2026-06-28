import { GeneratedTokensRepository } from "@database/repositories/GeneratedTokensRepository";
import { GlobalBannerStatsRepository } from "@database/repositories/GlobalBannerStatsRepository";
import { GlobalBannerTimelinesRepository } from "@database/repositories/GlobalBannerTimelinesRepository";
import { GlobalItemStatsRepository } from "@database/repositories/GlobalItemStatsRepository";
import { GlobalPityDistributionsRepository } from "@database/repositories/GlobalPityDistributionsRepository";
import { ImportErrorsRepository } from "@database/repositories/ImportErrorsRepository";
import { UserBannerStatsRepository } from "@database/repositories/UserBannerStatsRepository";
import { UserBannerTypeStatsRepository } from "@database/repositories/UserBannerTypeStatsRepository";
import { UserCharBannerPullsRepository } from "@database/repositories/UserCharBannerPullsRepository";
import { UserCharBannerTypePullsRepository } from "@database/repositories/UserCharBannerTypePullsRepository";
import { UsersRepository } from "@database/repositories/UsersRepository";
import { UserWeaponBannerPullsRepository } from "@database/repositories/UserWeaponBannerPullsRepository";
import { PrismaClient } from "@prisma/client";

export class Database {
    private readonly _prisma: PrismaClient;

    private readonly _usersRepository: UsersRepository;
    private readonly _generatedTokensRepository: GeneratedTokensRepository;
    private readonly _userBannerStatsRepository: UserBannerStatsRepository;
    private readonly _userBannerTypeStatsRepository: UserBannerTypeStatsRepository;
    private readonly _userCharBannerTypePullsRepository: UserCharBannerTypePullsRepository;
    private readonly _userCharBannerPullsRepository: UserCharBannerPullsRepository;
    private readonly _userWeaponBannerPullsRepository: UserWeaponBannerPullsRepository;
    private readonly _globalBannerStatsRepository: GlobalBannerStatsRepository;
    private readonly _globalBannerTimelinesRepository: GlobalBannerTimelinesRepository;
    private readonly _globalPityDistributionsRepository: GlobalPityDistributionsRepository;
    private readonly _globalItemStatsRepository: GlobalItemStatsRepository;
    private readonly _importErrorsRepository: ImportErrorsRepository;

    public constructor(prisma: PrismaClient) {
        const isValid = Database.isPrismaValid(prisma);

        if (!isValid) {
            throw new Error("Invalid prisma client");
        }

        this._prisma = prisma;

        this._usersRepository = new UsersRepository(prisma);
        this._generatedTokensRepository = new GeneratedTokensRepository(prisma);
        this._userBannerStatsRepository = new UserBannerStatsRepository(prisma);
        this._userBannerTypeStatsRepository = new UserBannerTypeStatsRepository(prisma);
        this._userCharBannerTypePullsRepository = new UserCharBannerTypePullsRepository(prisma);
        this._userCharBannerPullsRepository = new UserCharBannerPullsRepository(prisma);
        this._userWeaponBannerPullsRepository = new UserWeaponBannerPullsRepository(prisma);
        this._globalBannerStatsRepository = new GlobalBannerStatsRepository(prisma);
        this._globalBannerTimelinesRepository = new GlobalBannerTimelinesRepository(prisma);
        this._globalPityDistributionsRepository = new GlobalPityDistributionsRepository(prisma);
        this._globalItemStatsRepository = new GlobalItemStatsRepository(prisma);
        this._importErrorsRepository = new ImportErrorsRepository(prisma);
    }

    private static isPrismaValid(prisma: PrismaClient): boolean {
        return Boolean(
            prisma
            && prisma.user
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