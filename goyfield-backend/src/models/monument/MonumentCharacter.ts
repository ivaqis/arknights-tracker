import { Character } from "@models/gameProfile/Character.js";
import { IEntityClass } from "@models/IEntityClass.js";
import { MonumentCharacterEntity } from "@models/monument/entities/MonumentCharacterEntity.js";
import { MonumentCharData } from "@services/monumentFetcher/contracts/MonumentCharData.js";

export class MonumentCharacter implements IEntityClass<MonumentCharacterEntity> {
    private readonly _id: string;
    private readonly _level: number;
    private readonly _potentialLevel: number;

    private constructor(id: string, level: number, potentialLevel: number) {
        this._id = id;
        this._level = level;
        this._potentialLevel = potentialLevel;
    }

    public static getFromData(data: MonumentCharData, profileChar: Character): MonumentCharacter {
        if (data.charId !== profileChar.apiId) {
            throw new Error(`charId must be equal to profileCharId:\n${data.charId}\n${profileChar.apiId}`);
        }

        return new MonumentCharacter(
            profileChar.id,
            data.level,
            data.potentialLevel
        );
    }

    public static getFromEntity(entity: MonumentCharacterEntity): MonumentCharacter {
        return new MonumentCharacter(entity.id, entity.level, entity.potentialLevel);
    }

    public get id(): string {
        return this._id;
    }

    public get level(): number {
        return this._level;
    }

    public get potentialLevel(): number {
        return this._potentialLevel;
    }

    public getEntity(): MonumentCharacterEntity {
        return {
            id: this.id,
            level: this.level,
            potentialLevel: this.potentialLevel
        };
    }
}