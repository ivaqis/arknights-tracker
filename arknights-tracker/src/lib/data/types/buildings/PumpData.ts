import type { IData } from "$lib/classes/IData";

export interface PumpData extends IData {
    readonly pumpTimeMs: number;
    readonly enableLiquidIds: readonly string[];
}