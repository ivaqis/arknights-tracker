import { EquipableItemConditionType } from "$lib/classes/gameData/items/equipable/EquipableItemConditionType";

export interface EquipableItemData {
    readonly id: string;
    readonly condType: `${EquipableItemConditionType}`;
    readonly condParams: readonly string[];
    readonly castTime: number;
    readonly castCount: number;
    readonly castToMainCount: number;
    readonly cooldown: number;
    readonly recoverTime: number;
    readonly recoverUpperCount: number;
    readonly levelUpCastCount: number;
    readonly levelUpRecoverUpperCount: number;
}