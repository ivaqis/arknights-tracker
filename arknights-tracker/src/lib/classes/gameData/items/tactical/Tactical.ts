import { type EquipableItemConditionType } from "$lib/classes/gameData/items/equipable/EquipableItemConditionType";
import type { ITactical } from "$lib/classes/gameData/items/tactical/ITactical";
import type { EquipableItemData } from "$lib/data/types/items/EquipableItemData";

export class Tactical implements ITactical {
    private readonly _condType: EquipableItemConditionType;
    private readonly _condParams: readonly string[];
    private readonly _castTime: number;
    private readonly _castCount: number;
    private readonly _castToMainCount: number;
    private readonly _cooldown: number;
    private readonly _recoverTime: number;
    private readonly _recoverUpperCount: number;
    private readonly _levelUpCastCount: number;
    private readonly _levelUpRecoverUpperCount: number;

    public constructor(condType: EquipableItemConditionType, condParams: readonly string[], castTime: number, castCount: number, castToMainCount: number, cooldown: number, recoverTime: number, recoverUpperCount: number, levelUpCastCount: number, levelUpRecoverUpperCount: number) {
        this._condType = condType;
        this._condParams = condParams;
        this._castTime = castTime;
        this._castCount = castCount;
        this._castToMainCount = castToMainCount;
        this._cooldown = cooldown;
        this._recoverTime = recoverTime;
        this._recoverUpperCount = recoverUpperCount;
        this._levelUpCastCount = levelUpCastCount;
        this._levelUpRecoverUpperCount = levelUpRecoverUpperCount;
    }

    public static createFromData(data: EquipableItemData): Tactical {
        return new Tactical(
            data.condType as EquipableItemConditionType,
            data.condParams,
            data.castTime,
            data.castCount,
            data.castToMainCount,
            data.cooldown,
            data.recoverTime,
            data.recoverUpperCount,
            data.levelUpCastCount,
            data.levelUpRecoverUpperCount,
        );
    }

    public get condType(): EquipableItemConditionType {
        return this._condType;
    }

    public get condParams(): readonly string[] {
        return this._condParams;
    }

    public get castTime(): number {
        return this._castTime;
    }

    public get castCount(): number {
        return this._castCount;
    }

    public get castToMainCount(): number {
        return this._castToMainCount;
    }

    public get cooldown(): number {
        return this._cooldown;
    }

    public get recoverTime(): number {
        return this._recoverTime;
    }

    public get recoverUpperCount(): number {
        return this._recoverUpperCount;
    }

    public get levelUpCastCount(): number {
        return this._levelUpCastCount;
    }

    public get levelUpRecoverUpperCount(): number {
        return this._levelUpRecoverUpperCount;
    }

    public getValue(key: string): number {
        if (key === "count") {
            return this._castCount;
        }

        throw new Error(`Unexpected key ${key}`);
    }
}