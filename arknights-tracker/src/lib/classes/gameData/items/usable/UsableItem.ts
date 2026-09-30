import { Item } from "$lib/classes/gameData/items/Item";
import { type ItemGroup } from "$lib/classes/gameData/items/ItemGroup";
import { type ItemMaterial } from "$lib/classes/gameData/items/ItemMaterial";
import { type ItemType } from "$lib/classes/gameData/items/ItemType";
import type { ITactical } from "$lib/classes/gameData/items/tactical/ITactical";
import type { IUsableItem } from "$lib/classes/gameData/items/usable/IUsableItem";
import type { IImageIcon } from "$lib/classes/icons/IImageIcon";
import type { Rarity } from "$lib/classes/Rarity";

export class UsableItem extends Item implements IUsableItem {
    private readonly _tactical: ITactical | null;

    public constructor(id: string, gameId: string, rarity: Rarity, groupId: ItemGroup, type: ItemType, itemMaterial: ItemMaterial | null, icon: IImageIcon, subIcon: IImageIcon | null, tactical: ITactical | null) {
        super(id, gameId, rarity, groupId, type, itemMaterial, icon, subIcon);

        this._tactical = tactical;
    }

    public get tactical(): ITactical | null {
        return this._tactical;
    }

}