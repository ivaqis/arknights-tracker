import type { IFullGasJar } from "$lib/classes/gameData/items/fullJars/IFullGasJar";
import type { IItem } from "$lib/classes/gameData/items/IItem";
import { Item } from "$lib/classes/gameData/items/Item";
import type { ItemGroup } from "$lib/classes/gameData/items/ItemGroup";
import type { ItemMaterial } from "$lib/classes/gameData/items/ItemMaterial";
import type { ItemType } from "$lib/classes/gameData/items/ItemType";
import type { IImageIcon } from "$lib/classes/icons/IImageIcon";
import type { Rarity } from "$lib/classes/Rarity";

export class FullGasJar extends Item implements IFullGasJar {
    private readonly _emptyJar: IItem;
    private readonly _gas: IItem;

    public constructor(id: string, gameId: string, rarity: Rarity, groupId: ItemGroup, type: ItemType, itemMaterial: ItemMaterial | null, icon: IImageIcon, subIcon: IImageIcon | null, emptyJar: IItem, gas: IItem) {
        super(id, gameId, rarity, groupId, type, itemMaterial, icon, subIcon);

        this._emptyJar = emptyJar;
        this._gas = gas;
    }

    public static createFromItem(item: IItem, emptyJar: IItem, gas: IItem): FullGasJar {
        return new FullGasJar(
            item.id,
            item.gameId,
            item.rarity,
            item.groupId,
            item.type,
            item.material,
            item.icon,
            gas.icon,
            emptyJar,
            gas
        );
    }

    public get emptyJar(): IItem {
        return this._emptyJar;
    }

    public get gas(): IItem {
        return this._gas;
    }
}