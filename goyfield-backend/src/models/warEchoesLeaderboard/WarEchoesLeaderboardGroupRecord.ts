import { UserWarEchoesLeaderboardRecord } from "@database/records/UserWarEchoesLeaderboardRecord.js";
import { IEntityClass } from "@models/IEntityClass.js";
import { WarEchoesLeaderboardGroupRunRecordEntity } from "@models/warEchoesLeaderboard/entities/WarEchoesLeaderboardGroupRunRecordEntity.js";
import { WarEchoesLeaderboardRun } from "@models/warEchoesLeaderboard/WarEchoesLeaderboardRun.js";

export class WarEchoesLeaderboardGroupRecord implements IEntityClass<WarEchoesLeaderboardGroupRunRecordEntity> {
    private readonly _uid: string;
    private readonly _avatarId: string | null;
    private readonly _level: number;
    private readonly _serverId: string;
    private readonly _groupId: string;
    private readonly _totalPassTs: number;
    private readonly _records: WarEchoesLeaderboardRun[];

    private constructor(uid: string, avatarId: string | null, level: number, serverId: string, groupId: string, totalPassTs: number, records: WarEchoesLeaderboardRun[]) {
        this._uid = uid;
        this._avatarId = avatarId;
        this._level = level;
        this._serverId = serverId;
        this._groupId = groupId;
        this._totalPassTs = totalPassTs;
        this._records = records;
    }

    public static createFromEntity(entity: WarEchoesLeaderboardGroupRunRecordEntity): WarEchoesLeaderboardGroupRecord {
        return new WarEchoesLeaderboardGroupRecord(
            entity.uid,
            entity.avatarId,
            entity.level,
            entity.serverId,
            entity.groupId,
            entity.totalPassTs,
            entity.records.map(WarEchoesLeaderboardRun.createFromEntity)
        );
    }

    public static createFromRecord(profile: { uid: string; avatarId: string | null },
                                   gameProfile: { level: number, serverId: string },
                                   records: UserWarEchoesLeaderboardRecord[]
    ): WarEchoesLeaderboardGroupRecord {
        const groupId = records[0].userGroupId;
        const totalPassTs = records.reduce((total, cur) => total += cur.clearTimeSec, 0);

        return new WarEchoesLeaderboardGroupRecord(
            profile.uid,
            profile.avatarId,
            gameProfile.level,
            gameProfile.serverId,
            groupId,
            totalPassTs,
            records.map(record => WarEchoesLeaderboardRun.createFromRecord(record.id, record.data))
        );
    }

    public getEntity(): WarEchoesLeaderboardGroupRunRecordEntity {
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
