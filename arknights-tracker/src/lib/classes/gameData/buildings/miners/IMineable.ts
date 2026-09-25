import type { IItem } from "$lib/classes/gameData/items/IItem";
import type { IItemStack } from "$lib/classes/gameData/items/IItemStack";
import type { IResourcePoint } from "$lib/classes/gameData/resourcePoints/IResourcePoint";

export interface IMineable {
    get miningItem(): IItem;
    get resourcePoint(): IResourcePoint | null;
    get miningTimeMs(): number;
    get consumeItem(): IItemStack | null;
}