import { config } from "@/config.js";
import { ContractLeaderboardRepository } from "@database/repositories/ContractLeaderboardRepository.js";
import { ErrorsRepository } from "@database/repositories/ErrorsRepository.js";
import { GlobalBannerStatsRepository } from "@database/repositories/GlobalBannerStatsRepository.js";
import { GameProfilesRepository } from "@database/repositories/GameProfilesRepository.js";
import { MonumentLeaderboardRepository } from "@database/repositories/MonumentLeaderboardRepository.js";
import { UserBannerProfilesRepository } from "@database/repositories/UserBannerProfilesRepository.js";
import { UserBannerStatsRepository } from "@database/repositories/UserBannerStatsRepository.js";
import { UsersRepository } from "@database/repositories/UsersRepository.js";
import { PrismaClient } from "@generated/prisma-v2/index.js";
import { IService } from "@services/IService.js";

export class Database implements IService {
    public readonly name: string = "Database";

    private readonly _prisma: PrismaClient;

    private readonly _errorsRepository: ErrorsRepository;
    private readonly _usersRepository: UsersRepository;
    private readonly _userGameProfilesRepository: GameProfilesRepository;
    private readonly _monumentLeaderboardRepository: MonumentLeaderboardRepository;
    private readonly _contractLeaderboardRepository: ContractLeaderboardRepository;
    private readonly _userBannerProfilesRepository: UserBannerProfilesRepository;
    private readonly _userBannerStatsRepository: UserBannerStatsRepository;
    private readonly _globalBannerStatsRepository: GlobalBannerStatsRepository;

    public constructor(prisma: PrismaClient) {
        this._prisma = prisma;

        this._errorsRepository = new ErrorsRepository(prisma);
        this._usersRepository = new UsersRepository(prisma);
        this._userGameProfilesRepository = new GameProfilesRepository(prisma);
        this._monumentLeaderboardRepository = new MonumentLeaderboardRepository(prisma);
        this._contractLeaderboardRepository = new ContractLeaderboardRepository(prisma);
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

    public get users(): UsersRepository {
        return this._usersRepository;
    }

    public get gameProfiles(): GameProfilesRepository {
        return this._userGameProfilesRepository;
    }

    public get monumentLeaderboard(): MonumentLeaderboardRepository {
        return this._monumentLeaderboardRepository;
    }

    public get contractLeaderboard(): ContractLeaderboardRepository {
        return this._contractLeaderboardRepository;
    }

    public isActive(): boolean {
        return !!config.databaseUrl;
    }

    public async deleteUser(uid: bigint): Promise<void> {
        await this.users.deleteUser(uid);
    }

    public async deleteFirebaseUser(firebaseUid: string): Promise<void> {
        const users = await this.users.findManyUsersByFirebaseUid(firebaseUid);

        for (const user of users) {
            await this.deleteUser(user.uid);
        }

        await this.users.deleteFirebaseUser(firebaseUid);
    }
}