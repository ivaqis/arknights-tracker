import type { ICrafter } from "$lib/classes/gameData/buildings/crafters/ICrafter";
import type { IBuildingStorage } from "$lib/classes/storages/buildings/IBuildingStorage";

export interface ICrafterStorage extends IBuildingStorage<ICrafter> {}