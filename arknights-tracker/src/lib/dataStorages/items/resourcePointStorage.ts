import type { IResourcePointStorage } from "$lib/classes/storages/resourcePoints/IResourcePointStorage";
import { ResourcePointStorage } from "$lib/classes/storages/resourcePoints/ResourcePointStorage";
import { itemStorage } from "$lib/dataStorages/items/itemStorage";
import { resourcePointDataStorage } from "$lib/dataStorages/items/resourcePointDataStorage";

export const resourcePointStorage: IResourcePointStorage = new ResourcePointStorage(resourcePointDataStorage, itemStorage);