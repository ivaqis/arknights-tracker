import type { IData } from "$lib/classes/IData";
import type { CrafterModeData } from "$lib/data/types/buildings/CrafterModeData";

export interface CrafterData extends IData {
    readonly modeMap: readonly CrafterModeData[];
}