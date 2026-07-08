import { Repository } from "@database/repositories/Repository";
import { UserContractLeaderboardsTable } from "@database/tables/UserContractLeaderboardsTable";
import { UserGameProfilesTable } from "@database/tables/UserGameProfilesTable";
import { UserMonumentLeaderboardsTable } from "@database/tables/UserMonumentLeaderboardsTable";
import { PrismaClient } from "@prisma/client";

export class GameProfilesRepository extends Repository {
    private readonly _gameProfilesTable: UserGameProfilesTable;
    private readonly _contractTable: UserContractLeaderboardsTable;
    private readonly _monumentTable: UserMonumentLeaderboardsTable;

    public constructor(prisma: PrismaClient) {
        super(prisma);

        this._gameProfilesTable = new UserGameProfilesTable(prisma);
        this._contractTable = new UserContractLeaderboardsTable(prisma);
        this._monumentTable = new UserMonumentLeaderboardsTable(prisma);
    }

    public get gameProfilesTable(): UserGameProfilesTable {
        return this._gameProfilesTable;
    }

    public get contractTable(): UserContractLeaderboardsTable {
        return this._contractTable;
    }

    public get monumentTable(): UserMonumentLeaderboardsTable {
        return this._monumentTable;
    }
}