import { UserMonumentLeaderboardRecord } from "@database/records/UserMonumentLeaderboardRecord";
import { IEntityClass } from "@models/IEntityClass";
import {
    MonumentLeaderboardRunRecordEntity
} from "@models/monumentLeaderboard/entities/MonumentLeaderboardRunRecordEntity";
import { MonumentLeaderboardChar } from "@models/monumentLeaderboard/MonumentLeaderboardChar";

export class MonumentLeaderboardRecord implements IEntityClass<MonumentLeaderboardRunRecordEntity> {
    private readonly _uid: string;
    private readonly _avatarId: string | null;
    private readonly _level: number;
    private readonly _serverId: string;
    private readonly _recordId: string;
    private readonly _dungeonId: string;
    private readonly _ts: string;
    private readonly _passTs: number;
    private readonly _chars: MonumentLeaderboardChar[];

    private constructor(uid: string, avatarId: string | null, level: number, serverId: string, recordId: string, dungeonId: string, ts: string, passTs: number, chars: MonumentLeaderboardChar[]) {
        this._uid = uid;
        this._avatarId = avatarId;
        this._level = level;
        this._serverId = serverId;
        this._recordId = recordId;
        this._dungeonId = dungeonId;
        this._ts = ts;
        this._passTs = passTs;
        this._chars = chars;
    }

    public static createFromEntity(entity: MonumentLeaderboardRunRecordEntity): MonumentLeaderboardRecord {
        return new MonumentLeaderboardRecord(
            entity.uid,
            entity.avatarId,
            entity.level,
            entity.serverId,
            entity.recordId,
            entity.dungeonId,
            entity.ts,
            entity.passTs,
            entity.chars.map(MonumentLeaderboardChar.createFromEntity)
        );
    }

    public static createFromRecord(profile: { uid: string; avatarId: string | null },
                                   gameProfile: { level: number, serverId: string },
                                   record: UserMonumentLeaderboardRecord
    ): MonumentLeaderboardRecord {
        return new MonumentLeaderboardRecord(
            profile.uid,
            profile.avatarId,
            gameProfile.level,
            gameProfile.serverId,
            record.id,
            record.dungeonId,
            record.data.ts,
            record.data.passTS,
            record.data.chars.map(MonumentLeaderboardChar.createFromRecord)
        );
    }

    public getEntity(): MonumentLeaderboardRunRecordEntity {
        return {
            uid: this._uid,
            avatarId: this._avatarId,
            level: this._level,
            serverId: this._serverId,
            recordId: this._recordId,
            dungeonId: this._dungeonId,
            ts: this._ts,
            passTs: this._passTs,
            chars: this._chars.map(char => char.getEntity())
        };
    }
}