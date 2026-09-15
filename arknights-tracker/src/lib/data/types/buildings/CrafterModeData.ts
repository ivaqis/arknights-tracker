import type { CrafterModeName } from "$lib/classes/gameData/buildings/crafters/CrafterModeName";

export interface CrafterModeData {
    readonly formulaGroupId: string;
    readonly modeName: `${CrafterModeName}`;
}