import { IEntityClass } from "@models/IEntityClass.js";
import { WarEchoesRecord } from "@models/warEchoes/WarEchoesRecord.js";
import { WarEchoesLeaderboardRunEntity } from "@models/warEchoesLeaderboard/entities/WarEchoesLeaderboardRunEntity.js";
import { WarEchoesLeaderboardChar } from "@models/warEchoesLeaderboard/WarEchoesLeaderboardChar.js";

export class WarEchoesLeaderboardRun implements IEntityClass<WarEchoesLeaderboardRunEntity> {
    private readonly _recordId: string;
    private readonly _dungeonId: string;
    private readonly _ts: string;
    private readonly _passTs: number;
    private readonly _chars: WarEchoesLeaderboardChar[];

    private constructor(recordId: string, dungeonId: string, ts: string, passTs: number, chars: WarEchoesLeaderboardChar[]) {
        this._recordId = recordId;
        this._dungeonId = dungeonId;
        this._ts = ts;
        this._passTs = passTs;
        this._chars = chars;
    }

    public static createFromEntity(entity: WarEchoesLeaderboardRunEntity): WarEchoesLeaderboardRun {
        return new WarEchoesLeaderboardRun(
            entity.recordId,
            entity.dungeonId,
            entity.ts,
            entity.passTs,
            entity.chars.map(WarEchoesLeaderboardChar.createFromEntity)
        );
    }

    public static createFromRecord(recordId: string, data: WarEchoesRecord): WarEchoesLeaderboardRun {
        return new WarEchoesLeaderboardRun(
            recordId,
            data.dungeonId,
            data.ts,
            data.passTS,
            data.chars.map(WarEchoesLeaderboardChar.createFromRecord)
        );
    }

    public getEntity(): WarEchoesLeaderboardRunEntity {
        return {
            recordId: this._recordId,
            dungeonId: this._dungeonId,
            ts: this._ts,
            passTs: this._passTs,
            chars: this._chars.map(char => char.getEntity())
        };
    }
}
