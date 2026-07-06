import { BpSystemEntity } from "@models/gameProfile/entities/BpSystemEntity";
import { IEntityClass } from "@models/IEntityClass";

export class BpSystem implements IEntityClass<BpSystemEntity>{
    private readonly _curLevel: number;
    private readonly _maxLevel: number;

    public constructor(entity: BpSystemEntity) {
        this._curLevel = entity.curLevel;
        this._maxLevel = entity.maxLevel;
    }

    public get curLevel(): number {
        return this._curLevel;
    }

    public get maxLevel(): number {
        return this._maxLevel;
    }

    public getEntity(): BpSystemEntity {
        return {
            curLevel: this._curLevel,
            maxLevel: this._maxLevel
        };
    }
}