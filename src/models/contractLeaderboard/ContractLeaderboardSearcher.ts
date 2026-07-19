import { Database } from "@database/Database";
import { ContractLeaderboardRecord } from "@models/contractLeaderboard/ContractLeaderboardRecord";
import { ContractLeaderboardSortField } from "@models/contractLeaderboard/ContractLeaderboardSortField";
import { SortOrder } from "@models/SortOrder";

export class ContractLeaderboardSearcher {
    private readonly _database: Database;

    public constructor(database: Database) {
        this._database = database;
    }

    public async findPublic(contractId: string, serverId: string | null, sortField: ContractLeaderboardSortField, sortOrder: SortOrder, take?: number, skip?: number): Promise<ContractLeaderboardRecord[]> {
        const records = await this._database.gameProfiles.contractTable.findContractRecordsIncludeGameProfileAndUser(contractId, true, serverId, sortField, sortOrder, take, skip);

        return records.map(record => {
            const user = {
                uid: record.user.publicUid.initValue,
                avatarId: record.user.avatarId.initValue
            };
            const gameProfile = {
                level: record.gameProfile.level.initValue,
                serverId: record.gameProfile.serverId
            };

            return ContractLeaderboardRecord.createFromRecord(user, gameProfile, record.contractRecord.data);
        });
    }

    public async countPublic(contractId: string, serverId: string | null): Promise<number> {
        return await this._database.gameProfiles.contractTable.countByContractId(contractId, true, serverId);
    }
}