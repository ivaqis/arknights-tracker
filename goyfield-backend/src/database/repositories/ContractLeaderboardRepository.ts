import { UserContractCharacterEntity } from "@database/entities/UserContractCharacterEntity.js";
import { UserContractCharacterRecord } from "@database/records/UserContractCharacterRecord.js";
import { UserContractLeaderboardRecord } from "@database/records/UserContractLeaderboardRecord.js";
import { UserGameProfileRecord } from "@database/records/UserGameProfileRecord.js";
import { UserRecord } from "@database/records/UserRecord.js";
import { Repository } from "@database/repositories/Repository.js";
import { UserContractCharactersTable } from "@database/tables/UserContractCharactersTable.js";
import { UserContractLeaderboardsTable } from "@database/tables/UserContractLeaderboardsTable.js";
import { PrismaClient } from "@generated/prisma-v2/index.js";
import { ContractRecord } from "@models/contingencyContract/ContractRecord.js";
import { ContractLeaderboardSortField } from "@models/contractLeaderboard/ContractLeaderboardSortField.js";
import { SortOrder } from "@models/SortOrder.js";

export class ContractLeaderboardRepository extends Repository {
    private readonly _userContractLeaderboardsTable: UserContractLeaderboardsTable;
    private readonly _characterTable: UserContractCharactersTable;

    public constructor(prisma: PrismaClient) {
        super(prisma);

        this._userContractLeaderboardsTable = new UserContractLeaderboardsTable(prisma);
        this._characterTable = new UserContractCharactersTable(prisma);
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
        const record = await this._userContractLeaderboardsTable.create(gameUid, data);

        const entities: UserContractCharacterEntity[] = data.chars.map(char => {
            return {
                userRecordId: record.id,
                charId: char.id
            };
        });

        await this._characterTable.createMany(entities);

        return record;
    }

    public async delete(recordId: string): Promise<void> {
        return this._userContractLeaderboardsTable.delete(recordId);
    }

    public async deleteByGameUid(gameUid: string): Promise<void> {
        return this._userContractLeaderboardsTable.deleteByGameUid(gameUid);
    }

    public async findCharactersByUserRecordId(userRecordId: string, charId?: string): Promise<UserContractCharacterRecord[]> {
        return this._characterTable.findByUserRecordId(userRecordId, charId);
    }

    // public async countCharactersByContractId() // todo
}