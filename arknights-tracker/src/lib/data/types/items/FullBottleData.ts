import type { IData } from "$lib/classes/IData";

export interface FullBottleData extends IData {
    emptyBottleId: string;
    liquidId: string;
}