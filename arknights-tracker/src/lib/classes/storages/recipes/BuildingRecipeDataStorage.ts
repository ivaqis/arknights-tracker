import { DataMap } from "$lib/classes/collections/DataMap";
import type { IReadonlyDataMap } from "$lib/classes/collections/IReadonlyDataMap";
import type { IBuildingRecipeDataStorage } from "$lib/classes/storages/recipes/IBuildingRecipeDataStorage";
import { RecipeDataStorage } from "$lib/classes/storages/recipes/RecipeDataStorage";
import type { RecipeData } from "$lib/data/types/crafts/RecipeData";

export class BuildingRecipeDataStorage<TRecipe extends RecipeData>
    extends RecipeDataStorage<TRecipe>
    implements IBuildingRecipeDataStorage<TRecipe> {

    private readonly _byBuildingId: IReadonlyDataMap<string, readonly TRecipe[]>;

    public constructor(list: readonly TRecipe[], getBuildingId: (recipe: TRecipe) => string) {
        super(list);

        this._byBuildingId = DataMap.createListed(list, getBuildingId);
    }

    public get byBuildingId(): IReadonlyDataMap<string, readonly TRecipe[]> {
        return this._byBuildingId;
    }
}