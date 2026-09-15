import type { IPump } from "$lib/classes/gameData/buildings/pumps/IPump";
import type { IItem } from "$lib/classes/gameData/items/IItem";
import type { INaturalRecipe } from "$lib/classes/gameData/recipes/INaturalRecipe";

export interface IPumpRecipe extends INaturalRecipe<IPump, IItem, IItem> {}