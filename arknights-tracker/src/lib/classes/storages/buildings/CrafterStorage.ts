import { Crafter } from "$lib/classes/gameData/buildings/crafters/Crafter";
import { CrafterModeGroup } from "$lib/classes/gameData/buildings/crafters/CrafterModeGroup";
import type { ICrafter } from "$lib/classes/gameData/buildings/crafters/ICrafter";
import { BuildingStorage } from "$lib/classes/storages/buildings/BuildingStorage";
import type { IBuildingStorage } from "$lib/classes/storages/buildings/IBuildingStorage";
import type { ICrafterStorage } from "$lib/classes/storages/buildings/ICrafterStorage";
import type { IDataStorage } from "$lib/classes/storages/IDataStorage";
import type { CrafterData } from "$lib/data/types/buildings/CrafterData";

export class CrafterStorage extends BuildingStorage<ICrafter> implements ICrafterStorage {

    public constructor(list: ICrafter[]) {
        super(list);
    }

    public static createCrafterStorage(dataStorage: IDataStorage<CrafterData>, buildingStorage: IBuildingStorage): CrafterStorage {
        const list: ICrafter[] = [];

        for (const data of dataStorage.list) {
            const modes = data.modeMap.map(CrafterModeGroup.createFromData);
            const building = buildingStorage.byGameId.get(data.id);

            if (!building) {
                continue;
            }

            list.push(Crafter.createFromBuilding(building, modes));
        }

        return new CrafterStorage(list);
    }
}