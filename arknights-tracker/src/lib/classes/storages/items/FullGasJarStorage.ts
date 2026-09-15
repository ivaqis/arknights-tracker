import { DataMap } from "$lib/classes/collections/DataMap";
import type { IReadonlyDataMap } from "$lib/classes/collections/IReadonlyDataMap";
import { FullGasJar } from "$lib/classes/gameData/items/fullJars/FullGasJar";
import type { IFullGasJar } from "$lib/classes/gameData/items/fullJars/IFullGasJar";
import { GameDataStorage } from "$lib/classes/storages/GameDataStorage";
import type { IDataStorage } from "$lib/classes/storages/IDataStorage";
import type { IFullGasJarStorage } from "$lib/classes/storages/items/IFullGasJarStorage";
import type { IItemStorage } from "$lib/classes/storages/items/IItemStorage";
import type { FullJarData } from "$lib/data/types/items/FullJarData";

export class FullGasJarStorage extends GameDataStorage<IFullGasJar> implements IFullGasJarStorage {
    private readonly _byEmptyJarId: IReadonlyDataMap<string, IFullGasJar[]>;
    private readonly _byGasId: IReadonlyDataMap<string, IFullGasJar[]>;

    public constructor(itemStorage: IItemStorage, fullJarDataStorage: IDataStorage<FullJarData>) {
        const list = FullGasJarStorage.getList(itemStorage, fullJarDataStorage);

        super(list);

        this._byEmptyJarId = DataMap.createListed(list, item => item.emptyJar.gameId);
        this._byGasId = DataMap.createListed(list, item => item.gas.gameId);
    }

    private static getList(itemStorage: IItemStorage, fullJarDataStorage: IDataStorage<FullJarData>): IFullGasJar[] {
        const result: IFullGasJar[] = [];

        for (const fullJarData of fullJarDataStorage.list) {
            const item = itemStorage.byGameId.getOrThrow(fullJarData.id);
            const jar = itemStorage.byGameId.getOrThrow(fullJarData.emptyJarId);
            const gas = itemStorage.byGameId.getOrThrow(fullJarData.gasId);

            result.push(FullGasJar.createFromItem(item, jar, gas));
        }

        return result;
    }

    public get byEmptyJarId(): IReadonlyDataMap<string, IFullGasJar[]> {
        return this._byEmptyJarId;
    }

    public get byGasId(): IReadonlyDataMap<string, IFullGasJar[]> {
        return this._byGasId;
    }
}