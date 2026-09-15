import { Building } from "$lib/classes/gameData/buildings/Building";
import type { BuildingType } from "$lib/classes/gameData/buildings/BuildingType";
import type { IBuilding } from "$lib/classes/gameData/buildings/IBuilding";
import type { IMineable } from "$lib/classes/gameData/buildings/miners/IMineable";
import type { IMiner } from "$lib/classes/gameData/buildings/miners/IMiner";
import type { IItem } from "$lib/classes/gameData/items/IItem";
import type { IItemStack } from "$lib/classes/gameData/items/IItemStack";
import type { IMinerRecipe } from "$lib/classes/gameData/recipes/IMinerRecipe";
import { MinerRecipe } from "$lib/classes/gameData/recipes/MinerRecipe";
import type { IImageIcon } from "$lib/classes/icons/IImageIcon";
import { getMap } from "$lib/utils/collectionUtils";

export class Miner extends Building implements IMiner {
    private readonly _mineableMap: Map<string, IMineable>;
    private readonly _mineableList: readonly IMineable[];

    public constructor(id: string, gameId: string, type: BuildingType, item: IItem, icon: IImageIcon, mineableList: readonly IMineable[]) {
        super(id, gameId, type, item, icon);

        this._mineableList = mineableList;
        this._mineableMap = getMap(mineableList, item => item.miningItem.gameId);
    }

    public static createFromBuilding(building: IBuilding, mineableList: readonly IMineable[]): Miner {
        return new Miner(
            building.id,
            building.gameId,
            building.type,
            building.item,
            building.icon,
            mineableList
        );
    }

    public getMineableData(itemId: string): IMineable | null {
        return this._mineableMap.get(itemId) ?? null;
    }

    public get mineableList(): readonly IMineable[] {
        return this._mineableList;
    }

    public getRecipe(mineableItemId: string): IMinerRecipe | null {
        const mineableData = this.getMineableData(mineableItemId);

        if (!mineableData || !mineableData.resourcePoint) {
            return null;
        }

        const ingredients: IItemStack[] = mineableData.consumeItem ? [mineableData.consumeItem] : [];
        const outcomes: IItemStack[] = [
            {
                item: mineableData.miningItem,
                count: 1
            }
        ];

        return new MinerRecipe(
            ingredients,
            outcomes,
            this,
            mineableData.miningTimeMs,
            mineableData.resourcePoint
        );
    }

    public isMineable(itemId: string): boolean {
        return this._mineableMap.has(itemId);
    }
}