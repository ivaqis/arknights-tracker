import { BpSystemEntity } from "@models/gameProfile/entities/BpSystemEntity.js";
import { IEntityClass } from "@models/IEntityClass.js";

export class BpSystem implements IEntityClass<BpSystemEntity> {
    private readonly _curLevel: number;
    private readonly _maxLevel: number;

    private constructor(entity: BpSystemEntity) {
        this._curLevel = entity.curLevel;
        this._maxLevel = entity.maxLevel;
    }

    public static getFromData(data: BpSystemEntity): BpSystem {
        return this.getFromEntity(data);
    }

    public static getFromEntity(entity: BpSystemEntity): BpSystem {
        return new BpSystem(entity);
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