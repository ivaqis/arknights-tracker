import type { IFullBottle } from "$lib/classes/gameData/items/fullBottles/IFullBottle";
import type { IItem } from "$lib/classes/gameData/items/IItem";
import { Item } from "$lib/classes/gameData/items/Item";
import type { ItemGroup } from "$lib/classes/gameData/items/ItemGroup";
import type { ItemMaterial } from "$lib/classes/gameData/items/ItemMaterial";
import type { ItemType } from "$lib/classes/gameData/items/ItemType";
import type { IImageIcon } from "$lib/classes/icons/IImageIcon";
import type { Rarity } from "$lib/classes/Rarity";

export class FullBottle extends Item implements IFullBottle {
    private readonly _emptyBottle: IItem;
    private readonly _liquid: IItem;

    public constructor(id: string, gameId: string, rarity: Rarity, groupId: ItemGroup, type: ItemType, itemMaterial: ItemMaterial | null, icon: IImageIcon, subIcon: IImageIcon | null, emptyBottle: IItem, liquid: IItem) {
        super(id, gameId, rarity, groupId, type, itemMaterial, icon, subIcon);

        this._emptyBottle = emptyBottle;
        this._liquid = liquid;
    }

    public static createFromItem(item: IItem, emptyBottle: IItem, liquid: IItem): FullBottle {
        return new FullBottle(
            item.id,
            item.gameId,
            item.rarity,
            item.groupId,
            item.type,
            item.material,
            item.icon,
            liquid.icon,
            emptyBottle,
            liquid
        );
    }

    public get emptyBottle(): IItem {
        return this._emptyBottle;
    }

    public get liquid(): IItem {
        return this._liquid;
    }
}