import { Database } from "@database/Database.js";
import { ContractLeaderboardRecord } from "@models/contractLeaderboard/ContractLeaderboardRecord.js";
import { ContractLeaderboardSortField } from "@models/contractLeaderboard/ContractLeaderboardSortField.js";
import { SortOrder } from "@models/SortOrder.js";

export class ContractLeaderboardSearcher {
    private readonly _database: Database;

    public constructor(database: Database) {
        this._database = database;
    }

    public async findPublic(contractId: string, serverId: string | null, sortField: ContractLeaderboardSortField, sortOrder: SortOrder, take?: number, skip?: number, charCount?: number | null, withVideo?: boolean, includeChars?: string[], excludeChars?: string[]): Promise<ContractLeaderboardRecord[]> {
        const records = await this._database.contractLeaderboard.findContractRecordsIncludeGameProfileAndUser(contractId, true, serverId, sortField, sortOrder, take, skip, charCount, withVideo, includeChars, excludeChars);

        return records.map(record => {
            const user = {
                uid: record.user.publicUid.initValue,
                avatarId: record.user.avatarId.initValue
            };
            const gameProfile = {
                level: record.gameProfile.level.initValue,
                serverId: record.gameProfile.serverId
            };

            return ContractLeaderboardRecord.createFromRecord(user, gameProfile, record.contractRecord);
        });
    }

    public async countPublic(contractId: string, serverId: string | null, charCount?: number | null, withVideo?: boolean, includeChars?: string[], excludeChars?: string[]): Promise<number> {
        return await this._database.contractLeaderboard.countByContractId(contractId, true, serverId, charCount, withVideo, includeChars, excludeChars);
    }
}
