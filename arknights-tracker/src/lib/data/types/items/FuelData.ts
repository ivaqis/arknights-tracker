import type { IData } from "$lib/classes/IData";

export interface FuelData extends IData {
    readonly powerProvide: number;
    readonly progressRound: number;
}