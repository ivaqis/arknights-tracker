import type { IData } from "$lib/classes/IData";

export interface VaporizerData extends IData {
    readonly groups: readonly VaporizerGroupData[];
}

export interface VaporizerGroupData {
    consumeItem: string;
    consumeRate: number;
    maxConsumeRate: number;
    gasEnv: string;
}