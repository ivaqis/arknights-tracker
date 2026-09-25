import type { IData } from "$lib/classes/IData";
import type { MineableData } from "$lib/data/types/buildings/MineableData";

export interface MinerData extends IData {
    readonly id: string;
    readonly mineable: Readonly<Record<string, MineableData>>;
}