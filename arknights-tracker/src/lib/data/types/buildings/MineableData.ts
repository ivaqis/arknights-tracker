import type { ItemStackData } from "$lib/classes/gameData/items/ItemStackData";

export interface MineableData {
    readonly miningItemId: string;
    readonly miningTimeMs: number;
    readonly consumeItem: ItemStackData | null;
}