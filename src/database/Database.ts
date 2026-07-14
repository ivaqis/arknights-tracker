import { config } from "@/config";
import { ErrorsRepository } from "@database/repositories/ErrorsRepository";
import { GlobalBannerStatsRepository } from "@database/repositories/GlobalBannerStatsRepository";
import { GameProfilesRepository } from "@database/repositories/GameProfilesRepository";
import { UserBannerProfilesRepository } from "@database/repositories/UserBannerProfilesRepository";
import { UserBannerStatsRepository } from "@database/repositories/UserBannerStatsRepository";
import { UsersRepository } from "@database/repositories/UsersRepository";
import { PrismaClient } from "@prisma/client";
import { IService } from "@services/IService";

export class Database implements IService {
    public readonly name: string = "Database";

    private readonly _prisma: PrismaClient;

    private readonly _errorsRepository: ErrorsRepository;
    private readonly _usersRepository: UsersRepository;
    private readonly _userGameProfilesRepository: GameProfilesRepository;
    private readonly _userBannerProfilesRepository: UserBannerProfilesRepository;
    private readonly _userBannerStatsRepository: UserBannerStatsRepository;
    private readonly _globalBannerStatsRepository: GlobalBannerStatsRepository;

    public constructor(prisma: PrismaClient) {
        this._prisma = prisma;

        this._errorsRepository = new ErrorsRepository(prisma);
        this._usersRepository = new UsersRepository(prisma);
        this._userGameProfilesRepository = new GameProfilesRepository(prisma);
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

    public isActive(): boolean {
        return !!config.databaseUrl;
    }

    public async deleteUser(uid: bigint): Promise<void> {
        const gameProfiles = await this.gameProfiles.gameProfilesTable.findByUid(uid);

        for (const gameProfile of gameProfiles) {
            let gameUid = gameProfile.gameUid;

            await this.userBannerProfiles.removeGameUidLink(gameUid);
        }

        await this.users.deleteUser(uid);
    }

    public async deleteFirebaseUser(firebaseUid: string): Promise<void> {
        const users = await this.users.findUsersByFirebaseUid(firebaseUid);

        for (const user of users) {
            await this.deleteUser(user.uid);
        }

        await this.users.deleteFirebaseUser(firebaseUid);
    }
}