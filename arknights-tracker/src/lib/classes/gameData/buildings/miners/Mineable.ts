import type { IMineable } from "$lib/classes/gameData/buildings/miners/IMineable";
import type { IItem } from "$lib/classes/gameData/items/IItem";
import type { IItemStack } from "$lib/classes/gameData/items/IItemStack";
import type { IResourcePoint } from "$lib/classes/gameData/resourcePoints/IResourcePoint";

export class Mineable implements IMineable {
    private readonly _miningItem: IItem;
    private readonly _resourcePoint: IResourcePoint | null;
    private readonly _miningTimeMs: number;
    private readonly _consumeItem: IItemStack | null;

    public constructor(miningItem: IItem, resourcePoint: IResourcePoint | null, miningTimeMs: number, consumeItem: IItemStack | null) {
        this._miningItem = miningItem;
        this._resourcePoint = resourcePoint;
        this._miningTimeMs = miningTimeMs;
        this._consumeItem = consumeItem;
    }

    public get consumeItem(): IItemStack | null {
        return this._consumeItem;
    }

    public get miningItem(): IItem {
        return this._miningItem;
    }

    public get miningTimeMs(): number {
        return this._miningTimeMs;
    }

    public get resourcePoint(): IResourcePoint | null {
        return this._resourcePoint;
    }
}