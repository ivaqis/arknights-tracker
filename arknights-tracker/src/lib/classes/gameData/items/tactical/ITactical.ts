import type { IBoardable } from "$lib/classes/gameData/IBoardable";
import type { EquipableItemConditionType } from "$lib/classes/gameData/items/equipable/EquipableItemConditionType";

export interface ITactical extends IBoardable {
    get condType(): EquipableItemConditionType;
    get condParams(): readonly string[];
    get castTime(): number;
    get castCount(): number;
    get castToMainCount(): number;
    get cooldown(): number;
    get recoverTime(): number;
    get recoverUpperCount(): number;
    get levelUpCastCount(): number;
    get levelUpRecoverUpperCount(): number;
}