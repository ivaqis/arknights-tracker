import type { ICrafterMode } from "$lib/classes/gameData/buildings/crafters/ICrafterMode";

export interface ICrafterModeGroup {
    get formulaGroupId(): string;
    get mode(): ICrafterMode;
}