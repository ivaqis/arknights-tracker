import { weapons } from "$lib/data/weapons";
import { getMap } from "$lib/utils/collectionUtils";

export const weaponById = getMap(Object.values(weapons), item => item.id);
export const weaponByGameId = getMap(Object.values(weapons), item => item.gameId);
export const weaponByName = getMap(Object.values(weapons), item => item.name);