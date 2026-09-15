import type { IItem } from "$lib/classes/gameData/items/IItem";
import type { IResourcePoint } from "$lib/classes/gameData/resourcePoints/IResourcePoint";

export interface IEnableLiquid {
    get item(): IItem;
    get resourcePoint(): IResourcePoint | null;
}