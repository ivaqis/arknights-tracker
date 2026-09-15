import type { IReadonlyDataMap } from "$lib/classes/collections/IReadonlyDataMap";
import type { IPump } from "$lib/classes/gameData/buildings/pumps/IPump";
import type { IBuildingStorage } from "$lib/classes/storages/buildings/IBuildingStorage";

export interface IPumpStorage extends IBuildingStorage<IPump> {
    get byEnableLiquidId(): IReadonlyDataMap<string, IPump[]>;
}