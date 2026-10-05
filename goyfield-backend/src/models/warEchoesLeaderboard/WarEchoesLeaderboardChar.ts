import { IEntityClass } from "@models/IEntityClass.js";
import { WarEchoesCharacter } from "@models/warEchoes/WarEchoesCharacter.js";
import { WarEchoesLeaderboardCharEntity } from "@models/warEchoesLeaderboard/entities/WarEchoesLeaderboardCharEntity.js";

export class WarEchoesLeaderboardChar implements IEntityClass<WarEchoesLeaderboardCharEntity> {
    private readonly _id: string;
    private readonly _level: number;
    private readonly _potentialLevel: number;

    private constructor(id: string, level: number, potentialLevel: number) {
        this._id = id;
        this._level = level;
        this._potentialLevel = potentialLevel;
    }

    public static createFromEntity(entity: WarEchoesLeaderboardCharEntity): WarEchoesLeaderboardChar {
        return new WarEchoesLeaderboardChar(
            entity.id,
            entity.level,
            entity.potentialLevel
        );
    }

    public static createFromRecord(record: WarEchoesCharacter): WarEchoesLeaderboardChar {
        return new WarEchoesLeaderboardChar(
            record.id,
            record.level,
            record.potentialLevel
        );
    }

    public getEntity(): WarEchoesLeaderboardCharEntity {
        return {
            id: this._id,
            level: this._level,
            potentialLevel: this._potentialLevel
        };
    }
}
