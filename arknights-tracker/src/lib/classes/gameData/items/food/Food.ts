import type { IFood } from "$lib/classes/gameData/items/food/IFood";
import type { IFoodBuff } from "$lib/classes/gameData/items/food/IFoodBuff";
import type { IItem } from "$lib/classes/gameData/items/IItem";
import { Item } from "$lib/classes/gameData/items/Item";
import  { type ItemGroup } from "$lib/classes/gameData/items/ItemGroup";
import  { type ItemMaterial } from "$lib/classes/gameData/items/ItemMaterial";
import  { type ItemType } from "$lib/classes/gameData/items/ItemType";
import type { IImageIcon } from "$lib/classes/icons/IImageIcon";
import type { Rarity } from "$lib/classes/Rarity";

export class Food extends Item implements IFood {
    private readonly _duration: number;
    private readonly _buffs: readonly IFoodBuff[];

    public constructor(id: string, gameId: string, rarity: Rarity, groupId: ItemGroup, type: ItemType, itemMaterial: ItemMaterial | null, icon: IImageIcon, subIcon: IImageIcon | null, duration: number, buffs: readonly IFoodBuff[]) {
        super(id, gameId, rarity, groupId, type, itemMaterial, icon, subIcon);

        this._duration = duration;
        this._buffs = buffs;
    }

    public static createFoodFromItem(item: IItem, duration: number, buffs: IFoodBuff[]): Food {
        return new Food(
            item.id,
            item.gameId,
            item.rarity,
            item.groupId,
            item.type,
            item.material,
            item.icon,
            item.subIcon,
            duration,
            buffs,
        );
    }

    public get duration(): number {
        return this._duration;
    }

    public get buffs(): readonly IFoodBuff[] {
        return this._buffs;
    }

    public getBuff(buffId: string): IFoodBuff | null {
        return this._buffs.find(buff => buff.buffId === buffId) ?? null;
    }

    public hasBuff(buffId: string): boolean {
        return this._buffs.some(buff => buff.buffId === buffId);
    }
}