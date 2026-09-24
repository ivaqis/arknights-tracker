import { DataMap } from "$lib/classes/collections/DataMap";
import type { IReadonlyDataMap } from "$lib/classes/collections/IReadonlyDataMap";
import type { IVaporizer } from "$lib/classes/gameData/buildings/vaporizers/IVaporizer";
import type { IVaporizerGroup } from "$lib/classes/gameData/buildings/vaporizers/IVaporizerGroup";
import { Vaporizer } from "$lib/classes/gameData/buildings/vaporizers/Vaporizer";
import { VaporizerGroup } from "$lib/classes/gameData/buildings/vaporizers/VaporizerGroup";
import type { IGasEnv } from "$lib/classes/gameData/gasEnv/IGasEnv";
import { BuildingStorage } from "$lib/classes/storages/buildings/BuildingStorage";
import type { IBuildingStorage } from "$lib/classes/storages/buildings/IBuildingStorage";
import type { IVaporizerStorage } from "$lib/classes/storages/buildings/IVaporizerStorage";
import type { IDataStorage } from "$lib/classes/storages/IDataStorage";
import type { IItemStorage } from "$lib/classes/storages/items/IItemStorage";
import type { VaporizerData } from "$lib/data/types/buildings/VaporizerData";

export class VaporizerStorage extends BuildingStorage<IVaporizer> implements IVaporizerStorage {
    private readonly _byConsumeItemId: IReadonlyDataMap<string, IVaporizer[]>;
    private readonly _byGasEnvId: IReadonlyDataMap<string, IVaporizer[]>;

    public constructor(list: IVaporizer[]) {
        super(list);

        this._byConsumeItemId = DataMap.createListed(
            list,
            vaporizer => vaporizer.groups.map(group => group.consumeItem.gameId)
        );
        this._byGasEnvId = DataMap.createListed(
            list,
            vaporizer => vaporizer.groups.map(group => group.gasEnv.id)
        );
    }

    public static createVaporizerStorage(dataStorage: IDataStorage<VaporizerData>, buildingStorage: IBuildingStorage, itemStorage: IItemStorage, gasEnvStorage: IDataStorage<IGasEnv>): VaporizerStorage {
        const list: IVaporizer[] = [];

        for (const data of dataStorage.list) {
            const building = buildingStorage.byGameId.getOrThrow(data.id);
            const groups: IVaporizerGroup[] = data.groups
                .map(group => new VaporizerGroup(
                    gasEnvStorage.byId.getOrThrow(group.gasEnv),
                    itemStorage.byGameId.getOrThrow(group.consumeItem),
                    group.consumeRate,
                    group.maxConsumeRate
                ));

            list.push(Vaporizer.createFromBuilding(building, groups));
        }

        return new VaporizerStorage(list);
    }

    public get byConsumeItemId(): IReadonlyDataMap<string, IVaporizer[]> {
        return this._byConsumeItemId;
    }

    public get byGasEnvId(): IReadonlyDataMap<string, IVaporizer[]> {
        return this._byGasEnvId;
    }
}