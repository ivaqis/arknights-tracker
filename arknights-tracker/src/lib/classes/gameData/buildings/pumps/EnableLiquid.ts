import type { IEnableLiquid } from "$lib/classes/gameData/buildings/pumps/IEnableLiquid";
import type { IItem } from "$lib/classes/gameData/items/IItem";
import type { IResourcePoint } from "$lib/classes/gameData/resourcePoints/IResourcePoint";

export class EnableLiquid implements IEnableLiquid {
    private readonly _item: IItem;
    private readonly _resourcePoint: IResourcePoint | null;

    public constructor(item: IItem, resourcePoint: IResourcePoint | null) {
        this._item = item;
        this._resourcePoint = resourcePoint;
    }

    public get item(): IItem {
        return this._item;
    }

    public get resourcePoint(): IResourcePoint | null {
        return this._resourcePoint;
    }
}