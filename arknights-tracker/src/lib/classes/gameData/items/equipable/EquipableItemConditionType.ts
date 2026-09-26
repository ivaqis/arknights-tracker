export enum EquipableItemConditionType {
    CHAR_HP = "char_hp",
    CHAR_DOWN = "char_down",
    ARTS_REACTION = "arts_reaction",
    ULT_ENERGY = "ult_energy",
    DAMAGE_TAKEN = "damage",
}

export namespace EquipableItemConditionType {
    export function getI18nKey(cond: EquipableItemConditionType | "null"): string {
        return `equipableItemConditionType.${cond}`;
    }
}