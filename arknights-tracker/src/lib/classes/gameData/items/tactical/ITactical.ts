import type { IBlackboardEntry } from "$lib/classes/blackboard/IBlackboardEntry";
import type { IBoardable } from "$lib/classes/gameData/IBoardable";
import type { EquipableItemConditionType } from "$lib/classes/gameData/items/equipable/EquipableItemConditionType";
import type { LocalizationFn } from "$lib/i18n";

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

    formatCondType(textFn: LocalizationFn): string;
    formatCastTime(textFn: LocalizationFn): string;
    formatCastCount(textFn: LocalizationFn): string;
    formatCastToMainCount(textFn: LocalizationFn): string;
    formatCooldown(textFn: LocalizationFn): string;
    formatRecoverTime(textFn: LocalizationFn): string;
    formatRecoverUpperCount(textFn: LocalizationFn): string;

    getDetailList(textFn: LocalizationFn): IBlackboardEntry<string>[];
}