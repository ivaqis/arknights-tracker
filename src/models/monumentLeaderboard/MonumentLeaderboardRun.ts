import { IEntityClass } from "@models/IEntityClass";
import { MonumentRecord } from "@models/monument/MonumentRecord";
import { MonumentLeaderboardRunEntity } from "@models/monumentLeaderboard/entities/MonumentLeaderboardRunEntity";
import { MonumentLeaderboardChar } from "@models/monumentLeaderboard/MonumentLeaderboardChar";

export class MonumentLeaderboardRun implements IEntityClass<MonumentLeaderboardRunEntity> {
    private readonly _recordId: string;
    private readonly _dungeonId: string;
    private readonly _ts: string;
    private readonly _passTs: number;
    private readonly _chars: MonumentLeaderboardChar[];

    private constructor(recordId: string, dungeonId: string, ts: string, passTs: number, chars: MonumentLeaderboardChar[]) {
        this._recordId = recordId;
        this._dungeonId = dungeonId;
        this._ts = ts;
        this._passTs = passTs;
        this._chars = chars;
    }

    public static createFromEntity(entity: MonumentLeaderboardRunEntity): MonumentLeaderboardRun {
        return new MonumentLeaderboardRun(
            entity.recordId,
            entity.dungeonId,
            entity.ts,
            entity.passTs,
            entity.chars.map(MonumentLeaderboardChar.createFromEntity)
        );
    }

    public static createFromRecord(recordId: string, data: MonumentRecord): MonumentLeaderboardRun {
        return new MonumentLeaderboardRun(
            recordId,
            data.dungeonId,
            data.ts,
            data.passTS,
            data.chars.map(MonumentLeaderboardChar.createFromRecord)
        );
    }

    public getEntity(): MonumentLeaderboardRunEntity {
        return {
            recordId: this._recordId,
            dungeonId: this._dungeonId,
            ts: this._ts,
            passTs: this._passTs,
            chars: this._chars.map(char => char.getEntity())
        };
    }
}