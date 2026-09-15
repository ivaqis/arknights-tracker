import type { IGameData } from "$lib/classes/gameData/IGameData";
import type { ItemGroup } from "$lib/classes/gameData/items/ItemGroup";
import type { ItemMaterial } from "$lib/classes/gameData/items/ItemMaterial";
import type { ItemType } from "$lib/classes/gameData/items/ItemType";
import type { IImageIcon } from "$lib/classes/icons/IImageIcon";
import type { ITextable } from "$lib/classes/ITextable";
import type { Rarity } from "$lib/classes/Rarity";

export interface IItem extends IGameData, ITextable {
    get icon(): IImageIcon;
    get subIcon(): IImageIcon | null;
    get rarity(): Rarity;
    get groupId(): ItemGroup;
    get type(): ItemType;
    get material(): ItemMaterial | null;
}