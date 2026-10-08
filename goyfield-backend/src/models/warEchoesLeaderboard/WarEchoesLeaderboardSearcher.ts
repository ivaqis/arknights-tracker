import { database } from "@/serviceInstances.js";
import { Database } from "@database/Database.js";
import { MonumentFilters } from "@database/MonumentFilters.js";
import { UserWarEchoesLeaderboardRecord } from "@database/records/UserWarEchoesLeaderboardRecord.js";
import { WarEchoesLeaderboardGroupRecord } from "@models/warEchoesLeaderboard/WarEchoesLeaderboardGroupRecord.js";
import { WarEchoesLeaderboardRecord } from "@models/warEchoesLeaderboard/WarEchoesLeaderboardRecord.js";
import { WarEchoesLeaderboardSortField } from "@models/warEchoesLeaderboard/WarEchoesLeaderboardSortField.js";
import { SortOrder } from "@models/SortOrder.js";
import { warEchoesGroupRecords } from "@staticModels/instances.js";

export class WarEchoesLeaderboardSearcher {
    private readonly _database: Database = database;

    public constructor(database: Database) {
        this._database = database;
    }

    private static createListMap<T, K>(list: K[]): Map<K, T[]> {
        const map = new Map<K, T[]>();

        for (const item of list) {
            map.set(item, []);
        }

        return map;
    }

    private static getMinCount(groupId: string, difficulty: string): number {
        return warEchoesGroupRecords.getDungeonsByDifficulty(groupId, difficulty)?.length ?? 0;
    }

    public async findPublicGroups(groupId: string, difficulty: string, serverId: string | null, sortField: WarEchoesLeaderboardSortField, sortOrder: SortOrder, filters: MonumentFilters, take: number, skip: number): Promise<WarEchoesLeaderboardGroupRecord[]> {
        const minCount = WarEchoesLeaderboardSearcher.getMinCount(groupId, difficulty);

        const groupIds = await this._database.warEchoesLeaderboard.findUserGroupsByGroupId(groupId, difficulty, true, serverId, sortField, sortOrder, minCount, filters, take, skip);
        const records = await this._database.warEchoesLeaderboard.findManyGroupsIncludeGameProfileAndUser(groupIds);

        const runs = await this._database.warEchoesLeaderboard.findManyByUserGroupId(groupIds);

        const groupedRuns = WarEchoesLeaderboardSearcher.createListMap<UserWarEchoesLeaderboardRecord, string>(groupIds);
        for (const run of runs) {
            let list = groupedRuns.get(run.userGroupId);

            if (!list) {
                continue;
            }

            list.push(run);
        }

        return records.map(r => {
            const groupRuns = groupedRuns.get(r.group.id);

            if (!groupRuns) {
                throw new Error(`No runs for group: ${r.group.id} (${r.group.groupId} ${r.group.difficulty} ${r.group.gameUid})`);
            }

            const profile = {
                uid: r.user.publicUid.initValue,
                avatarId: r.user.avatarId.initValue
            };

            const gameProfile = {
                level: r.gameProfile.level.initValue,
                serverId: r.gameProfile.serverId
            };

            return WarEchoesLeaderboardGroupRecord.createFromRecord(
                profile,
                gameProfile,
                groupRuns
            );
        });
    }

    public async findPublicRuns(dungeonId: string, serverId: string | null, sortField: WarEchoesLeaderboardSortField, sortOrder: SortOrder, filters: MonumentFilters, take?: number, skip?: number, groupId?: string): Promise<WarEchoesLeaderboardRecord[]> {
        const records = await this._database.warEchoesLeaderboard.findByDungeonIdIncludeGameProfileAndUser(dungeonId, true, serverId, sortField, sortOrder, filters, take, skip, groupId);

        return records.map(record => {
            const profile = {
                uid: record.user.publicUid.initValue,
                avatarId: record.user.avatarId.initValue
            };

            const gameProfile = {
                level: record.gameProfile.level.initValue,
                serverId: record.gameProfile.serverId,
            };

            return WarEchoesLeaderboardRecord.createFromRecord(profile, gameProfile, record.record);
        });
    }

    public async countPublicGroupRuns(groupId: string, difficulty: string, serverId: string | null, filters: MonumentFilters): Promise<number> {
        const minCount = WarEchoesLeaderboardSearcher.getMinCount(groupId, difficulty);

        return await this._database.warEchoesLeaderboard.countByGroupId(groupId, difficulty, true, serverId, minCount, filters);
    }

    public async countPublicRuns(dungeonId: string, serverId: string | null, filters: MonumentFilters, groupId?: string): Promise<number> {
        return await this._database.warEchoesLeaderboard.countByDungeonId(dungeonId, true, serverId, filters, groupId);
    }
}
