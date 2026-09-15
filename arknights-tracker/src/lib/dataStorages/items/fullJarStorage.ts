import { FullGasJarStorage } from "$lib/classes/storages/items/FullGasJarStorage";
import type { IFullGasJarStorage } from "$lib/classes/storages/items/IFullGasJarStorage";
import { fullJarDataStorage } from "$lib/dataStorages/items/fullJarDataStorage";
import { itemStorage } from "$lib/dataStorages/items/itemStorage";

export const fullJarStorage: IFullGasJarStorage = new FullGasJarStorage(itemStorage, fullJarDataStorage);