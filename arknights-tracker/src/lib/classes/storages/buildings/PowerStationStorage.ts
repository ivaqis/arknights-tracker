import { DataMap } from "$lib/classes/collections/DataMap";
import type { IReadonlyDataMap } from "$lib/classes/collections/IReadonlyDataMap";
import type { IPowerStation } from "$lib/classes/gameData/buildings/powerStations/IPowerStation";
import { PowerStation } from "$lib/classes/gameData/buildings/powerStations/PowerStation";
import { BuildingStorage } from "$lib/classes/storages/buildings/BuildingStorage";
import type { IBuildingStorage } from "$lib/classes/storages/buildings/IBuildingStorage";
import type { IPowerStationStorage } from "$lib/classes/storages/buildings/IPowerStationStorage";
import type { IDataStorage } from "$lib/classes/storages/IDataStorage";
import type { IFuelStorage } from "$lib/classes/storages/items/IFuelStorage";
import type { PowerStationData } from "$lib/data/types/buildings/PowerStationData";

export class PowerStationStorage extends BuildingStorage<IPowerStation> implements IPowerStationStorage {
    private readonly _byEnableFuelId: IReadonlyDataMap<string, IPowerStation[]>;

    public constructor(list: IPowerStation[]) {
        super(list);

        this._byEnableFuelId = DataMap.createListed(
            list,
            station => station.enableFuelList.map(item => item.gameId)
        );
    }

    public static createPowerStationStorage(dataStorage: IDataStorage<PowerStationData>, buildingStorage: IBuildingStorage, fuelStorage: IFuelStorage): PowerStationStorage {
        const list: IPowerStation[] = [];

        for (const data of dataStorage.list) {
            const building = buildingStorage.byGameId.getOrThrow(data.id);
            const enableFuel = fuelStorage.list;

            list.push(PowerStation.createFromBuilding(building, data.msPerRound, enableFuel));
        }

        return new PowerStationStorage(list);
    }

    public get byEnableFuelId(): IReadonlyDataMap<string, IPowerStation[]> {
        return this._byEnableFuelId;
    }
}