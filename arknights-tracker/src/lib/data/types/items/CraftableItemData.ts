import type { ItemGroup } from "$lib/classes/gameData/items/ItemGroup";
import type { ItemMaterial } from "$lib/classes/gameData/items/ItemMaterial";
import type { ItemType } from "$lib/classes/gameData/items/ItemType";
import type { IData } from "$lib/classes/IData";

export interface CraftableItemData extends IData {
    craftableGroupId: `${ItemGroup}`;
    craftableType: `${ItemType}`;
    craftableMaterial: `${ItemMaterial}` | null;
}
