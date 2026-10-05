import type { IBlackboardEntry } from "$lib/classes/blackboard/IBlackboardEntry";
import { UsableTargetType } from "$lib/classes/gameData/items/usable/UsableTargetType";

export interface FoodData {
    readonly id: string;
    readonly duration: number;
    readonly stackingKey: "buff" | null;
    readonly targetType: `${UsableTargetType}`;
    readonly buffs: readonly FoodBuffData[];
}

export interface FoodBuffData {
    readonly buffId: string;
    readonly blackboard: readonly IBlackboardEntry[];
}