import type { IFuel } from "$lib/classes/gameData/items/fuel/IFuel";
import type { IItem } from "$lib/classes/gameData/items/IItem";
import { Item } from "$lib/classes/gameData/items/Item";
import type { ItemGroup } from "$lib/classes/gameData/items/ItemGroup";
import type { ItemMaterial } from "$lib/classes/gameData/items/ItemMaterial";
import type { ItemType } from "$lib/classes/gameData/items/ItemType";
import type { IImageIcon } from "$lib/classes/icons/IImageIcon";
import type { Rarity } from "$lib/classes/Rarity";

export class Fuel extends Item implements IFuel {
    private readonly _powerProvide: number;
    private readonly _progressRound: number;

    public constructor(id: string, gameId: string, rarity: Rarity, groupId: ItemGroup, type: ItemType, itemMaterial: ItemMaterial | null, icon: IImageIcon, subIcon: IImageIcon | null, powerProvide: number, progressRound: number) {
        super(id, gameId, rarity, groupId, type, itemMaterial, icon, subIcon);

        this._powerProvide = powerProvide;
        this._progressRound = progressRound;
    }

    public static createFromItem(item: IItem, powerProvide: number, progressRound: number): Fuel {
        return new Fuel(
            item.id,
            item.gameId,
            item.rarity,
            item.groupId,
            item.type,
            item.material,
            item.icon,
            item.subIcon,
            powerProvide,
            progressRound
        );
    }

    public get powerProvide(): number {
        return this._powerProvide;
    }

    public get progressRound(): number {
        return this._progressRound;
    }
}