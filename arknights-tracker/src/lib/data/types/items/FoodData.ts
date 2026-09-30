import type { IBlackboardEntry } from "$lib/classes/blackboard/IBlackboardEntry";

export interface FoodData {
    readonly id: string;
    readonly duration: number;
    readonly stackingKey: "buff" | null;
    readonly buffs: readonly FoodBuffData[];
}

export interface FoodBuffData {
    readonly buffId: string;
    readonly blackboard: readonly IBlackboardEntry[];
}