import { GasEnv } from "$lib/classes/gameData/gasEnv/GasEnv";
import type { IGasEnv } from "$lib/classes/gameData/gasEnv/IGasEnv";
import { DataStorage } from "$lib/classes/storages/DataStorage";
import type { IDataStorage } from "$lib/classes/storages/IDataStorage";
import type { GasEnvData } from "$lib/data/types/items/GasEnvData";

export class GasEnvStorage extends DataStorage<IGasEnv> implements IDataStorage<IGasEnv> {

    public constructor(list: IGasEnv[]) {
        super(list);
    }

    public static create(dataList: readonly GasEnvData[]): GasEnvStorage {
        const list: IGasEnv[] = dataList.map(GasEnv.createFromData);

        return new GasEnvStorage(list);
    }
}