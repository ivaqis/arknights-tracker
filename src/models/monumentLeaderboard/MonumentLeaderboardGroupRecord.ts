import { UserMonumentLeaderboardRecord } from "@database/records/UserMonumentLeaderboardRecord";
import { IEntityClass } from "@models/IEntityClass";
import {
    MonumentLeaderboardGroupRunRecordEntity
} from "@models/monumentLeaderboard/entities/MonumentLeaderboardGroupRunRecordEntity";
import { MonumentLeaderboardRun } from "@models/monumentLeaderboard/MonumentLeaderboardRun";

export class MonumentLeaderboardGroupRecord implements IEntityClass<MonumentLeaderboardGroupRunRecordEntity> {
    private readonly _uid: string;
    private readonly _avatarId: string | null;
    private readonly _level: number;
    private readonly _serverId: string;
    private readonly _groupId: string;
    private readonly _totalPassTs: number;
    private readonly _records: MonumentLeaderboardRun[];

    private constructor(uid: string, avatarId: string | null, level: number, serverId: string, groupId: string, totalPassTs: number, records: MonumentLeaderboardRun[]) {
        this._uid = uid;
        this._avatarId = avatarId;
        this._level = level;
        this._serverId = serverId;
        this._groupId = groupId;
        this._totalPassTs = totalPassTs;
        this._records = records;
    }

    public static createFromEntity(entity: MonumentLeaderboardGroupRunRecordEntity): MonumentLeaderboardGroupRecord {
        return new MonumentLeaderboardGroupRecord(
            entity.uid,
            entity.avatarId,
            entity.level,
            entity.serverId,
            entity.groupId,
            entity.totalPassTs,
            entity.records.map(MonumentLeaderboardRun.createFromEntity)
        );
    }

    public static createFromRecord(profile: { uid: string; avatarId: string | null },
                                   gameProfile: { level: number, serverId: string },
                                   records: UserMonumentLeaderboardRecord[]
    ): MonumentLeaderboardGroupRecord {
        const groupId = records[0].groupId;
        const totalPassTs = records.reduce((total, cur) => total += cur.clearTimeSec, 0);

        return new MonumentLeaderboardGroupRecord(
            profile.uid,
            profile.avatarId,
            gameProfile.level,
            gameProfile.serverId,
            groupId,
            totalPassTs,
            records.map(record => MonumentLeaderboardRun.createFromRecord(record.id, record.data))
        );
    }

    public getEntity(): MonumentLeaderboardGroupRunRecordEntity {
        return {
            uid: this._uid,
            avatarId: this._avatarId,
            level: this._level,
            serverId: this._serverId,
            groupId: this._groupId,
            totalPassTs: this._totalPassTs,
            records: this._records.map(record => record.getEntity())
        };
    }
}