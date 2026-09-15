import type { IBuilding } from "$lib/classes/gameData/buildings/IBuilding";
import type { ICrafterModeGroup } from "$lib/classes/gameData/buildings/crafters/ICrafterModeGroup";

export interface ICrafter extends IBuilding {
    get modes(): readonly ICrafterModeGroup[];
}