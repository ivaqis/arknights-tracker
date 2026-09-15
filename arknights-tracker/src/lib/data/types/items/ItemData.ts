import type { ItemGroup } from "$lib/classes/gameData/items/ItemGroup";
import type { ItemMaterial } from "$lib/classes/gameData/items/ItemMaterial";
import type { ItemType } from "$lib/classes/gameData/items/ItemType";
import type { IData } from "$lib/classes/IData";
import type { Rarity } from "$lib/classes/Rarity";

export interface ItemData extends IData {
    iconId: string;
    rarity: Rarity;
    groupId: `${ItemGroup}`;
    type: `${ItemType}`;
    material: `${ItemMaterial}` | null;
}