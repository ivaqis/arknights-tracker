import type { IVaporizerGroup } from "$lib/classes/gameData/buildings/vaporizers/IVaporizerGroup";
import type { IGasEnv } from "$lib/classes/gameData/gasEnv/IGasEnv";
import type { IItem } from "$lib/classes/gameData/items/IItem";

export class VaporizerGroup implements IVaporizerGroup {
    private readonly _gasEnv: IGasEnv;
    private readonly _consumeItem: IItem;
    private readonly _consumeRate: number;
    private readonly _maxConsumeRate: number;

    public constructor(gasEnv: IGasEnv, consumeItem: IItem, consumeRate: number, maxConsumeRate: number) {
        this._gasEnv = gasEnv;
        this._consumeItem = consumeItem;
        this._consumeRate = consumeRate;
        this._maxConsumeRate = maxConsumeRate;
    }

    public get consumeItem(): IItem {
        return this._consumeItem;
    }

    public get consumeRate(): number {
        return this._consumeRate;
    }

    public get gasEnv(): IGasEnv {
        return this._gasEnv;
    }

    public get maxConsumeRate(): number {
        return this._maxConsumeRate;
    }
}