import { DataStorage } from "$lib/classes/storages/DataStorage";
import type { IDataStorage } from "$lib/classes/storages/IDataStorage";
import { resourcePoints } from "$lib/data/items/resourcePoints";
import type { ResourcePointData } from "$lib/data/types/items/ResourcePointData";

export const resourcePointDataStorage: IDataStorage<ResourcePointData> = new DataStorage(Object.values(resourcePoints));