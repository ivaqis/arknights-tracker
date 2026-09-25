import type { IPump } from "$lib/classes/gameData/buildings/pumps/IPump";
import type { IPumpRecipe } from "$lib/classes/gameData/recipes/IPumpRecipe";
import type { IBuildingRecipeSearcher } from "$lib/classes/searchers/recipes/IBuildingRecipeSearcher";
import type { IBuildingRecipeSearchResult } from "$lib/classes/searchers/recipes/results/IBuildingRecipeSearchResult";

export interface IPumpRecipeSearcher extends IBuildingRecipeSearcher<IBuildingRecipeSearchResult<IPump, IPumpRecipe>> {}