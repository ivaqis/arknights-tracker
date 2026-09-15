import type { IMiner } from "$lib/classes/gameData/buildings/miners/IMiner";
import type { IItem } from "$lib/classes/gameData/items/IItem";
import type { INaturalRecipe } from "$lib/classes/gameData/recipes/INaturalRecipe";

export interface IMinerRecipe extends INaturalRecipe<IMiner, IItem, IItem> {}