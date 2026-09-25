import { Building } from "$lib/classes/gameData/buildings/Building";
import type { IBuilding } from "$lib/classes/gameData/buildings/IBuilding";
import { DataMap } from "$lib/classes/collections/DataMap";
import type { IReadonlyDataMap } from "$lib/classes/collections/IReadonlyDataMap";
import type { IBuildingStorage } from "$lib/classes/storages/buildings/IBuildingStorage";
import { GameDataStorage } from "$lib/classes/storages/GameDataStorage";
import type { IDataStorage } from "$lib/classes/storages/IDataStorage";
import type { IItemStorage } from "$lib/classes/storages/items/IItemStorage";
import type { BuildingData } from "$lib/data/types/buildings/BuildingData";

export class BuildingStorage<TBuilding extends IBuilding = IBuilding>
    extends GameDataStorage<TBuilding>
    implements IBuildingStorage<TBuilding> {

    private readonly _byItemId: IReadonlyDataMap<string, TBuilding>;

    public constructor(list: TBuilding[]) {
        super(list);

        this._byItemId = DataMap.create(list, item => item.item.gameId);
    }

    public static createBuildingStorage(dataStorage: IDataStorage<BuildingData>, itemStorage: IItemStorage): BuildingStorage {
        const list: IBuilding[] = [];

        for (const data of dataStorage.list) {
            const item = itemStorage.byGameId.get(data.itemId);

            if (!item) {
                continue;
            }

            list.push(Building.createFromData(data, item));
        }

        return new BuildingStorage(list);
    }

    public get byItemId(): IReadonlyDataMap<string, TBuilding> {
        return this._byItemId;
    }
}