import { ErrorsRepository } from "@database/repositories/ErrorsRepository";
import { GlobalBannerStatsRepository } from "@database/repositories/GlobalBannerStatsRepository";
import { UserBannerProfilesRepository } from "@database/repositories/UserBannerProfilesRepository";
import { UserBannerStatsRepository } from "@database/repositories/UserBannerStatsRepository";
import { PrismaClient } from "@prisma/client";

export class Database {
    private readonly _prisma: PrismaClient;

    private readonly _errorsRepository: ErrorsRepository;
    private readonly _userBannerProfilesRepository: UserBannerProfilesRepository;
    private readonly _userBannerStatsRepository: UserBannerStatsRepository;
    private readonly _globalBannerStatsRepository: GlobalBannerStatsRepository;

    public constructor(prisma: PrismaClient) {
        this._prisma = prisma;

        this._errorsRepository = new ErrorsRepository(prisma);
        this._userBannerProfilesRepository = new UserBannerProfilesRepository(prisma);
        this._userBannerStatsRepository = new UserBannerStatsRepository(prisma);
        this._globalBannerStatsRepository = new GlobalBannerStatsRepository(prisma);
    }

    public get errors(): ErrorsRepository {
        return this._errorsRepository;
    }

    public get userBannerProfiles(): UserBannerProfilesRepository {
        return this._userBannerProfilesRepository;
    }

    public get userBannerStats(): UserBannerStatsRepository {
        return this._userBannerStatsRepository;
    }

    public get globalBannerStats(): GlobalBannerStatsRepository {
        return this._globalBannerStatsRepository;
    }
}