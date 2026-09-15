import { DataStorage } from "$lib/classes/storages/DataStorage";
import type { IDataStorage } from "$lib/classes/storages/IDataStorage";
import { fullJars } from "$lib/data/items/fullJars";
import type { FullJarData } from "$lib/data/types/items/FullJarData";

export const fullJarDataStorage: IDataStorage<FullJarData> = new DataStorage(Object.values(fullJars));