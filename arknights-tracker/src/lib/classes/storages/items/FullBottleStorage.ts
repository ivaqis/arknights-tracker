import { DataMap } from "$lib/classes/collections/DataMap";
import type { IReadonlyDataMap } from "$lib/classes/collections/IReadonlyDataMap";
import { FullBottle } from "$lib/classes/gameData/items/fullBottles/FullBottle";
import type { IFullBottle } from "$lib/classes/gameData/items/fullBottles/IFullBottle";
import { GameDataStorage } from "$lib/classes/storages/GameDataStorage";
import type { IDataStorage } from "$lib/classes/storages/IDataStorage";
import type { IFullBottleStorage } from "$lib/classes/storages/items/IFullBottleStorage";
import type { IItemStorage } from "$lib/classes/storages/items/IItemStorage";
import type { FullBottleData } from "$lib/data/types/items/FullBottleData";

export class FullBottleStorage extends GameDataStorage<IFullBottle> implements IFullBottleStorage {
    private readonly _byEmptyBottleId: IReadonlyDataMap<string, IFullBottle[]>;
    private readonly _byLiquidId: IReadonlyDataMap<string, IFullBottle[]>;

    public constructor(itemStorage: IItemStorage, fullBottleDataStorage: IDataStorage<FullBottleData>) {
        const list = FullBottleStorage.getList(itemStorage, fullBottleDataStorage);

        super(list);

        this._byEmptyBottleId = DataMap.createListed(list, item => item.emptyBottle.gameId);
        this._byLiquidId = DataMap.createListed(list, item => item.liquid.gameId);
    }

    private static getList(itemStorage: IItemStorage, fullBottleDataStorage: IDataStorage<FullBottleData>): IFullBottle[] {
        const result: IFullBottle[] = [];

        for (const fullBottleData of fullBottleDataStorage.list) {
            const item = itemStorage.byGameId.getOrThrow(fullBottleData.id);
            const bottle = itemStorage.byGameId.getOrThrow(fullBottleData.emptyBottleId);
            const liquid = itemStorage.byGameId.getOrThrow(fullBottleData.liquidId);

            result.push(FullBottle.createFromItem(item, bottle, liquid));
        }

        return result;
    }

    public get byEmptyBottleId(): IReadonlyDataMap<string, IFullBottle[]> {
        return this._byEmptyBottleId;
    }

    public get byLiquidId(): IReadonlyDataMap<string, IFullBottle[]> {
        return this._byLiquidId;
    }
}