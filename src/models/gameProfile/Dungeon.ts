import { DungeonEntity } from "@models/gameProfile/entities/DungeonEntity";
import { IEntityClass } from "@models/IEntityClass";

export class Dungeon implements IEntityClass<DungeonEntity> {
    private readonly _curStamina: string;
    private readonly _maxTs: string;
    private readonly _maxStamina: string;

    public constructor(entity: DungeonEntity) {
        this._curStamina = entity.curStamina;
        this._maxTs = entity.maxTs;
        this._maxStamina = entity.maxStamina;
    }

    public get curStamina(): string {
        return this._curStamina;
    }

    public get maxTs(): string {
        return this._maxTs;
    }

    public get maxStamina(): string {
        return this._maxStamina;
    }

    public getEntity(): DungeonEntity {
        return {
            curStamina: this._curStamina,
            maxTs: this._maxTs,
            maxStamina: this._maxStamina,
        };
    }
}