import { DataMap } from "$lib/classes/collections/DataMap";
import type { IReadonlyDataMap } from "$lib/classes/collections/IReadonlyDataMap";
import { EnableLiquid } from "$lib/classes/gameData/buildings/pumps/EnableLiquid";
import type { IEnableLiquid } from "$lib/classes/gameData/buildings/pumps/IEnableLiquid";
import type { IPump } from "$lib/classes/gameData/buildings/pumps/IPump";
import { Pump } from "$lib/classes/gameData/buildings/pumps/Pump";
import { BuildingStorage } from "$lib/classes/storages/buildings/BuildingStorage";
import type { IBuildingStorage } from "$lib/classes/storages/buildings/IBuildingStorage";
import type { IPumpStorage } from "$lib/classes/storages/buildings/IPumpStorage";
import type { IDataStorage } from "$lib/classes/storages/IDataStorage";
import type { IItemStorage } from "$lib/classes/storages/items/IItemStorage";
import type { IResourcePointStorage } from "$lib/classes/storages/resourcePoints/IResourcePointStorage";
import type { PumpData } from "$lib/data/types/buildings/PumpData";

export class PumpStorage extends BuildingStorage<IPump> implements IPumpStorage {
    private readonly _byEnableLiquidId: IReadonlyDataMap<string, IPump[]>;

    public constructor(list: IPump[]) {
        super(list);

        this._byEnableLiquidId = DataMap.createListed(
            list,
            pump => pump.enableLiquids.map(item => item.item.gameId)
        );
    }

    public static createPumpStorage(dataStorage: IDataStorage<PumpData>, buildingStorage: IBuildingStorage, itemStorage: IItemStorage, resourcePointStorage: IResourcePointStorage): PumpStorage {
        const list: IPump[] = [];

        for (const data of dataStorage.list) {
            const building = buildingStorage.byGameId.getOrThrow(data.id);
            const enableLiquids: IEnableLiquid[] = data.enableLiquidIds
                .map(liquidId => new EnableLiquid(
                    itemStorage.byGameId.getOrThrow(liquidId),
                    resourcePointStorage.byItemId.get(liquidId) ?? null
                ));

            list.push(Pump.createFromBuilding(building, data.pumpTimeMs, enableLiquids));
        }

        return new PumpStorage(list);
    }

    public get byEnableLiquidId(): IReadonlyDataMap<string, IPump[]> {
        return this._byEnableLiquidId;
    }
}