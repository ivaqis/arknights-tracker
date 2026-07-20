import { UserContractLeaderboardRecord } from "@database/records/UserContractLeaderboardRecord";
import { UserGameProfileRecord } from "@database/records/UserGameProfileRecord";
import { UserRecord } from "@database/records/UserRecord";
import { Repository } from "@database/repositories/Repository";
import { UserContractLeaderboardsTable } from "@database/tables/UserContractLeaderboardsTable";
import { ContractRecord } from "@models/contingencyContract/ContractRecord";
import { ContractLeaderboardSortField } from "@models/contractLeaderboard/ContractLeaderboardSortField";
import { SortOrder } from "@models/SortOrder";
import { PrismaClient } from "@prisma/client";

export class ContractLeaderboardRepository extends Repository {
    private readonly _userContractLeaderboardsTable: UserContractLeaderboardsTable;

    public constructor(prisma: PrismaClient) {
        super(prisma);

        this._userContractLeaderboardsTable = new UserContractLeaderboardsTable(prisma);
    }

    public async find(id: string): Promise<UserContractLeaderboardRecord | null> {
        return this._userContractLeaderboardsTable.find(id);
    }

    public async findByRecordId(recordId: string): Promise<UserContractLeaderboardRecord | null> {
        return this._userContractLeaderboardsTable.findByRecordId(recordId);
    }

    public async findByContractId(contractId: string, publicOnly: boolean, serverId: string | null): Promise<UserContractLeaderboardRecord[]> {
        return this._userContractLeaderboardsTable.findByContractId(contractId, publicOnly, serverId);
    }

    public async countByContractId(contractId: string, publicOnly: boolean, serverId: string | null): Promise<number> {
        return this._userContractLeaderboardsTable.countByContractId(contractId, publicOnly, serverId);
    }

    public async findByGameUid(gameUid: string, contractId?: string): Promise<UserContractLeaderboardRecord[]> {
        return this._userContractLeaderboardsTable.findByGameUid(gameUid, contractId);
    }

    public async findBestByGameUid(gameUid: string, contractId?: string): Promise<UserContractLeaderboardRecord | null> {
        return this._userContractLeaderboardsTable.findBestByGameUid(gameUid, contractId);
    }

    public async findContractRecordsIncludeGameProfileAndUser(contractId: string, publicOnly: boolean, serverId: string | null): Promise<{
        contractRecord: UserContractLeaderboardRecord,
        gameProfile: UserGameProfileRecord,
        user: UserRecord
    }[]>;
    public async findContractRecordsIncludeGameProfileAndUser(contractId: string, publicOnly: boolean, serverId: string | null, sortField: ContractLeaderboardSortField, sortOrder: SortOrder, take?: number, skip?: number): Promise<{
        contractRecord: UserContractLeaderboardRecord,
        gameProfile: UserGameProfileRecord,
        user: UserRecord
    }[]>;

    public async findContractRecordsIncludeGameProfileAndUser(contractId: string,
                                                              publicOnly: boolean,
                                                              serverId: string | null,
                                                              sortField?: ContractLeaderboardSortField,
                                                              sortOrder?: SortOrder,
                                                              take?: number,
                                                              skip?: number
    ): Promise<{
        contractRecord: UserContractLeaderboardRecord,
        gameProfile: UserGameProfileRecord,
        user: UserRecord
    }[]> {
        return this._userContractLeaderboardsTable.findContractRecordsIncludeGameProfileAndUser(contractId, publicOnly, serverId, sortField, sortOrder, take, skip);
    }

    public async create(gameUid: string, data: ContractRecord): Promise<UserContractLeaderboardRecord> {
        return this._userContractLeaderboardsTable.create(gameUid, data);
    }

    public async delete(recordId: string): Promise<void> {
        return this._userContractLeaderboardsTable.delete(recordId);
    }

    public async deleteByGameUid(gameUid: string): Promise<void> {
        return this._userContractLeaderboardsTable.deleteByGameUid(gameUid);
    }
}