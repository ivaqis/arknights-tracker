import { database } from "@/serviceInstances.js";
import { Database } from "@database/Database.js";
import { MonumentFilters } from "@database/MonumentFilters.js";
import { UserMonumentLeaderboardRecord } from "@database/records/UserMonumentLeaderboardRecord.js";
import { MonumentLeaderboardGroupRecord } from "@models/monumentLeaderboard/MonumentLeaderboardGroupRecord.js";
import { MonumentLeaderboardRecord } from "@models/monumentLeaderboard/MonumentLeaderboardRecord.js";
import { MonumentLeaderboardSortField } from "@models/monumentLeaderboard/MonumentLeaderboardSortField.js";
import { SortOrder } from "@models/SortOrder.js";
import { monumentGroupRecords } from "@staticModels/instances.js";

export class MonumentLeaderboardSearcher {
    private readonly _database: Database = database;

    public constructor(database: Database) {
        this._database = database;
    }

    private static createMap<K, V>(list: V[], getIdFunc: (v: V) => K): Map<K, V> {
        const map = new Map<K, V>();

        for (const item of list) {
            map.set(getIdFunc(item), item);
        }

        return map;
    }

    private static createListMap<T, K>(list: K[]): Map<K, T[]> {
        const map = new Map<K, T[]>();

        for (const item of list) {
            map.set(item, []);
        }

        return map;
    }

    private static getMinCount(groupId: string, isHard: boolean): number {
        return isHard
            ? monumentGroupRecords.getHardDungeons(groupId)?.length ?? 0
            : monumentGroupRecords.getNormalDungeons(groupId)?.length ?? 0;
    }

    public async findPublicGroups(groupId: string, isHard: boolean, serverId: string | null, sortField: MonumentLeaderboardSortField, sortOrder: SortOrder, monumentFilters: MonumentFilters, take: number, skip: number): Promise<MonumentLeaderboardGroupRecord[]> {
        const minCount = MonumentLeaderboardSearcher.getMinCount(groupId, isHard);

        const groupIds = await this._database.monumentLeaderboard.findUserGroupsByGroupId(groupId, isHard, true, serverId, sortField, sortOrder, minCount, monumentFilters, take, skip);
        const records = await this._database.monumentLeaderboard.findManyGroupsIncludeGameProfileAndUser(groupIds);

        const runs = await this._database.monumentLeaderboard.findManyByUserGroupId(groupIds);

        const groupedRuns = MonumentLeaderboardSearcher.createListMap<UserMonumentLeaderboardRecord, string>(groupIds);
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
                throw new Error(`No runs for group: ${r.group.id} (${r.group.groupId} ${r.group.isHard} ${r.group.gameUid})`);
            }

            const profile = {
                uid: r.user.publicUid.initValue,
                avatarId: r.user.avatarId.initValue
            };

            const gameProfile = {
                level: r.gameProfile.level.initValue,
                serverId: r.gameProfile.serverId
            };

            return MonumentLeaderboardGroupRecord.createFromRecord(
                profile,
                gameProfile,
                groupRuns
            );
        });
    }

    public async findPublicRuns(dungeonId: string, serverId: string | null, sortField: MonumentLeaderboardSortField, sortOrder: SortOrder, monumentFilters: MonumentFilters, take?: number, skip?: number): Promise<MonumentLeaderboardRecord[]> {
        const records = await this._database.monumentLeaderboard.findByDungeonIdIncludeGameProfileAndUser(dungeonId, true, serverId, sortField, sortOrder, monumentFilters, take, skip);

        return records.map(record => {
            const profile = {
                uid: record.user.publicUid.initValue,
                avatarId: record.user.avatarId.initValue
            };

            const gameProfile = {
                level: record.gameProfile.level.initValue,
                serverId: record.gameProfile.serverId,
            };

            return MonumentLeaderboardRecord.createFromRecord(profile, gameProfile, record.record);
        });
    }

    public async countPublicGroupRuns(groupId: string, isHard: boolean, serverId: string | null, filters: MonumentFilters): Promise<number> {
        const minCount = MonumentLeaderboardSearcher.getMinCount(groupId, isHard);

        return await this._database.monumentLeaderboard.countByGroupId(groupId, isHard, true, serverId, minCount, filters);
    }

    public async countPublicRuns(dungeonId: string, serverId: string | null, filters: MonumentFilters): Promise<number> {
        return await this._database.monumentLeaderboard.countByDungeonId(dungeonId, true, serverId, filters);
    }
}