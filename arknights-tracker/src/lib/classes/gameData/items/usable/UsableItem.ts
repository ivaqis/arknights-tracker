import type { IBlackboardEntry } from "$lib/classes/blackboard/IBlackboardEntry";
import { Item } from "$lib/classes/gameData/items/Item";
import { type ItemGroup } from "$lib/classes/gameData/items/ItemGroup";
import { type ItemMaterial } from "$lib/classes/gameData/items/ItemMaterial";
import { type ItemType } from "$lib/classes/gameData/items/ItemType";
import type { ITactical } from "$lib/classes/gameData/items/tactical/ITactical";
import type { IUsableItem } from "$lib/classes/gameData/items/usable/IUsableItem";
import  { UsableTargetType } from "$lib/classes/gameData/items/usable/UsableTargetType";
import type { IImageIcon } from "$lib/classes/icons/IImageIcon";
import type { Rarity } from "$lib/classes/Rarity";
import type { LocalizationFn } from "$lib/i18n";

export class UsableItem extends Item implements IUsableItem {
    private readonly _tactical: ITactical | null;
    private readonly _targetType: UsableTargetType;

    public constructor(id: string, gameId: string, rarity: Rarity, groupId: ItemGroup, type: ItemType, itemMaterial: ItemMaterial | null, icon: IImageIcon, subIcon: IImageIcon | null, tactical: ITactical | null, targetType: UsableTargetType) {
        super(id, gameId, rarity, groupId, type, itemMaterial, icon, subIcon);

        this._tactical = tactical;
        this._targetType = targetType;
    }

    public get tactical(): ITactical | null {
        return this._tactical;
    }

    public get targetType(): UsableTargetType {
        return this._targetType;
    }

    public getDetailList(textFn: LocalizationFn): IBlackboardEntry<string>[] {
        return [
            this.getTargetTypeDetail(textFn),
        ];
    }

    private getTargetTypeDetail(textFn: LocalizationFn): IBlackboardEntry<string> {
        return {
            key: textFn("usableTitle.targetType"),
            value: textFn(UsableTargetType.getI18nKey(this._targetType))
        };
    }
}