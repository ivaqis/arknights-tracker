import { IEntityClass } from "@models/IEntityClass.js";
import { MonumentCharacter } from "@models/monument/MonumentCharacter.js";
import { MonumentLeaderboardCharEntity } from "@models/monumentLeaderboard/entities/MonumentLeaderboardCharEntity.js";

export class MonumentLeaderboardChar implements IEntityClass<MonumentLeaderboardCharEntity> {
    private readonly _id: string;
    private readonly _level: number;
    private readonly _potentialLevel: number;

    private constructor(id: string, level: number, potentialLevel: number) {
        this._id = id;
        this._level = level;
        this._potentialLevel = potentialLevel;
    }

    public static createFromEntity(entity: MonumentLeaderboardCharEntity): MonumentLeaderboardChar {
        return new MonumentLeaderboardChar(
            entity.id,
            entity.level,
            entity.potentialLevel
        );
    }

    public static createFromRecord(record: MonumentCharacter): MonumentLeaderboardChar {
        return new MonumentLeaderboardChar(
            record.id,
            record.level,
            record.potentialLevel
        );
    }

    public getEntity(): MonumentLeaderboardCharEntity {
        return {
            id: this._id,
            level: this._level,
            potentialLevel: this._potentialLevel
        };
    }
}