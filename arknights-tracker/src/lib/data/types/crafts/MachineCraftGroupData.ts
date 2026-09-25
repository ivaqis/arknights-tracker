import type { IData } from "$lib/classes/IData";

export interface MachineCraftGroupData extends IData {
    readonly craftList: readonly string[];
}