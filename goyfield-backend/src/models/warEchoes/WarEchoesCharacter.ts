import { Character } from "@models/gameProfile/Character.js";
import { IEntityClass } from "@models/IEntityClass.js";
import { WarEchoesCharacterEntity } from "@models/warEchoes/entities/WarEchoesCharacterEntity.js";
import { WarEchoesCharData } from "@services/warEchoesFetcher/contracts/WarEchoesCharData.js";

export class WarEchoesCharacter implements IEntityClass<WarEchoesCharacterEntity> {
    private readonly _id: string;
    private readonly _level: number;
    private readonly _potentialLevel: number;

    private constructor(id: string, level: number, potentialLevel: number) {
        this._id = id;
        this._level = level;
        this._potentialLevel = potentialLevel;
    }

    public static getFromData(data: WarEchoesCharData, profileChar: Character): WarEchoesCharacter {
        if (data.charId !== profileChar.apiId) {
            throw new Error(`charId must be equal to profileCharId:\n${data.charId}\n${profileChar.apiId}`);
        }

        return new WarEchoesCharacter(
            profileChar.id,
            data.level,
            data.potentialLevel
        );
    }

    public static getFromEntity(entity: WarEchoesCharacterEntity): WarEchoesCharacter {
        return new WarEchoesCharacter(entity.id, entity.level, entity.potentialLevel);
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

    public getEntity(): WarEchoesCharacterEntity {
        return {
            id: this.id,
            level: this.level,
            potentialLevel: this.potentialLevel
        };
    }
}
