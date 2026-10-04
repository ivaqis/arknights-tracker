import { Food } from "$lib/classes/gameData/items/food/Food";
import { FoodBuff } from "$lib/classes/gameData/items/food/FoodBuff";
import type { IFood } from "$lib/classes/gameData/items/food/IFood";
import type { IItem } from "$lib/classes/gameData/items/IItem";
import { Tactical } from "$lib/classes/gameData/items/tactical/Tactical";
import type { UsableTargetType } from "$lib/classes/gameData/items/usable/UsableTargetType";
import { GameDataStorage } from "$lib/classes/storages/GameDataStorage";
import type { IDataStorage } from "$lib/classes/storages/IDataStorage";
import type { IGameDataStorage } from "$lib/classes/storages/IGameDataStorage";
import type { ReadonlyBbValueFormatMap } from "$lib/data/types/BbValueFormat";
import type { EquipableItemData } from "$lib/data/types/items/EquipableItemData";
import type { FoodData } from "$lib/data/types/items/FoodData";

export class FoodStorage extends GameDataStorage<IFood> {

    public constructor(list: readonly IFood[]) {
        super(list);
    }

    public static create(dataList: readonly FoodData[], equipItemStorage: IDataStorage<EquipableItemData>, itemStorage: IGameDataStorage<IItem>, formats: Readonly<Record<string, ReadonlyBbValueFormatMap>>): FoodStorage {
        const list: IFood[] = [];

        for (const data of dataList) {
            const tacticalData = equipItemStorage.byId.get(data.id);
            const tactical = tacticalData ? Tactical.createFromData(tacticalData) : null;
            const item = itemStorage.byGameId.getOrThrow(data.id);
            const buffs = data.buffs.map(buff => FoodBuff.createFromData(buff, formats[buff.buffId]));

            list.push(Food.createFoodFromItem(
                item,
                tactical,
                data.targetType as UsableTargetType,
                data.duration,
                buffs
            ));
        }

        return new FoodStorage(list);
    }
}