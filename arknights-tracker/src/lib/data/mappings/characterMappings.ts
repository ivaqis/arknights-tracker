import { characters } from "$lib/data/characters";
import { getMap } from "$lib/utils/collectionUtils";

export const characterById = getMap(Object.values(characters), (char) => char.id);
export const characterByName = getMap(Object.values(characters), (char) => char.name);
export const characterByGameId = getMap(Object.values(characters), (char) => char.gameId);