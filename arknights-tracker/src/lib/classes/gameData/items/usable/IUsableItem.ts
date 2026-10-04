import type { IBlackboardEntry } from "$lib/classes/blackboard/IBlackboardEntry";
import type { IItem } from "$lib/classes/gameData/items/IItem";
import type { ITactical } from "$lib/classes/gameData/items/tactical/ITactical";
import type { UsableTargetType } from "$lib/classes/gameData/items/usable/UsableTargetType";
import type { LocalizationFn } from "$lib/i18n";

export interface IUsableItem extends IItem {
    get tactical(): ITactical | null;
    get targetType(): UsableTargetType;

    getDetailList(textFn: LocalizationFn): IBlackboardEntry<string>[];
}