import type { IGameData } from "$lib/classes/gameData/IGameData";
import type { IItem } from "$lib/classes/gameData/items/IItem";
import type { IRecipe } from "$lib/classes/gameData/recipes/IRecipe";

export interface IManualCraft extends IRecipe<IItem, IItem>, IGameData {}