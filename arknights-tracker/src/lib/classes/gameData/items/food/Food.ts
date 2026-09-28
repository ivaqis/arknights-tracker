import type { IFood } from "$lib/classes/gameData/items/food/IFood";
import type { IFoodBuff } from "$lib/classes/gameData/items/food/IFoodBuff";
import type { IItem } from "$lib/classes/gameData/items/IItem";
import { type ItemGroup } from "$lib/classes/gameData/items/ItemGroup";
import { type ItemMaterial } from "$lib/classes/gameData/items/ItemMaterial";
import { type ItemType } from "$lib/classes/gameData/items/ItemType";
import type { ITactical } from "$lib/classes/gameData/items/tactical/ITactical";
import { UsableItem } from "$lib/classes/gameData/items/usable/UsableItem";
import type { IImageIcon } from "$lib/classes/icons/IImageIcon";
import type { Rarity } from "$lib/classes/Rarity";

export class Food extends UsableItem implements IFood {
    private readonly _duration: number;
    private readonly _buffs: readonly IFoodBuff[];

    public constructor(id: string, gameId: string, rarity: Rarity, groupId: ItemGroup, type: ItemType, itemMaterial: ItemMaterial | null, icon: IImageIcon, subIcon: IImageIcon | null, tactical: ITactical | null, duration: number, buffs: readonly IFoodBuff[]) {
        super(id, gameId, rarity, groupId, type, itemMaterial, icon, subIcon, tactical);

        this._duration = duration;
        this._buffs = buffs;
    }

    public static createFoodFromItem(item: IItem, tactical: ITactical | null, duration: number, buffs: IFoodBuff[]): Food {
        return new Food(
            item.id,
            item.gameId,
            item.rarity,
            item.groupId,
            item.type,
            item.material,
            item.icon,
            item.subIcon,
            tactical,
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

    public getValue(key: string): number {
        const tokens = key.split("\\");

        if (tokens.length === 1) {
            const entry = this._buffs[0]?.getBBEntry(key);

            if (!entry) {
                throw new Error(`Could not get value for ${key}`);
            }

            return entry.value;
        }

        if (tokens.length === 2) {
            const buff = this.getBuff(tokens[0]);

            if (!buff) {
                throw new Error(`Buff not found: ${tokens[0]}`);
            }

            const entry = buff.getBBEntry(tokens[1]);

            if (!entry) {
                throw new Error(`Could not get value for ${key}`);
            }

            return entry.value;
        }

        throw new Error(`Too many keys ${key} (${tokens.length})`);
    }
}