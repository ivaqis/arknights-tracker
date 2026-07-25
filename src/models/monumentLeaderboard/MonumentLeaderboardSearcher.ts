import { database } from "@/serviceInstances";
import { Database } from "@database/Database";
import { MonumentFilters } from "@database/MonumentFilters";
import { UserMonumentLeaderboardRecord } from "@database/records/UserMonumentLeaderboardRecord";
import { MonumentLeaderboardGroupRecord } from "@models/monumentLeaderboard/MonumentLeaderboardGroupRecord";
import { MonumentLeaderboardRecord } from "@models/monumentLeaderboard/MonumentLeaderboardRecord";
import { MonumentLeaderboardSortField } from "@models/monumentLeaderboard/MonumentLeaderboardSortField";
import { SortOrder } from "@models/SortOrder";
import { monumentGroupRecords } from "@staticModels/instances";

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
        const groups = await this._database.monumentLeaderboard.findManyUserGroups(groupIds);
        const runs = await this._database.monumentLeaderboard.findManyByUserGroupId(groupIds);

        const gameUids = groups.map(group => group.gameUid);
        const gameProfiles = await this._database.gameProfiles.findMany(gameUids);

        const uids = gameProfiles.map(g => g.uid);
        const users = await this._database.users.findManyUsers(uids);

        const usersMap = MonumentLeaderboardSearcher.createMap(users, user => user.uid);
        const gameProfilesMap = MonumentLeaderboardSearcher.createMap(gameProfiles, profile => profile.gameUid);

        const groupedRuns = MonumentLeaderboardSearcher.createListMap<UserMonumentLeaderboardRecord, string>(groupIds);
        for (const run of runs) {
            let list = groupedRuns.get(run.userGroupId);

            if (!list) {
                continue;
            }

            list.push(run);
        }

        return groups.map(group => {
            const gameProfile = gameProfilesMap.get(group.gameUid);

            if (!gameProfile) {
                throw new Error(`No gameProfile for group:\ngameUid: ${group.gameUid}\ngroupId: ${group.groupId}\nisHard: ${group.isHard}\nid: ${group.id}`);
            }

            const profile = usersMap.get(gameProfile.uid);

            if (!profile) {
                throw new Error(`No profile for gameProfile:\ngameUid: ${group.gameUid}\ngroupId: ${group.groupId}\nisHard: ${group.isHard}\nid: ${group.id}`);
            }

            const records = groupedRuns.get(group.id);

            if (!records) {
                throw new Error(`No records for group:\ngameUid: ${group.gameUid}\ngroupId: ${group.groupId}\nisHard: ${group.isHard}\nid: ${group.id}`)
            }

            return MonumentLeaderboardGroupRecord.createFromRecord(
                { uid: profile.publicUid.initValue, avatarId: profile.avatarId.initValue },
                { level: gameProfile.level.initValue, serverId: gameProfile.serverId },
                records
            );
        })
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