import type { BuildingType } from "$lib/classes/gameData/buildings/BuildingType";
import type { IData } from "$lib/classes/IData";

export interface BuildingData extends IData {
    readonly type: `${BuildingType}`;
    readonly itemId: string;
    readonly iconId: string;
}