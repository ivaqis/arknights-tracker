import type { IBlackboardEntry } from "$lib/classes/blackboard/IBlackboardEntry";
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

    formatCondType(textFn: (key: string) => string): string;
    formatCastTime(textFn: (key: string) => string): string;
    formatCastCount(textFn: (key: string) => string): string;
    formatCastToMainCount(textFn: (key: string) => string): string;
    formatCooldown(textFn: (key: string) => string): string;
    formatRecoverTime(textFn: (key: string) => string): string;
    formatRecoverUpperCount(textFn: (key: string) => string): string;

    getDetailList(textFn: (key: string) => string): IBlackboardEntry<string>[];
}