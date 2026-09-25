import { AItemRecipeFactory } from "$lib/classes/factories/recipes/AItemRecipeFactory";
import type { IManualCraftFactory } from "$lib/classes/factories/recipes/IManualCraftFactory";
import type { IManualCraft } from "$lib/classes/gameData/recipes/IManualCraft";
import { ManualCraft } from "$lib/classes/gameData/recipes/ManualCraft";
import type { IItemStorage } from "$lib/classes/storages/items/IItemStorage";
import type { ManualCraftData } from "$lib/data/types/crafts/ManualCraftData";

export class ManualCraftFactory
    extends AItemRecipeFactory<ManualCraftData, IManualCraft>
    implements IManualCraftFactory {

    public constructor(itemStorage: IItemStorage) {
        super(itemStorage);
    }

    public create(recipeData: ManualCraftData): IManualCraft {
        const ingredients = this.getItemStackList(recipeData.ingredients);
        const outcomes = this.getItemStackList(recipeData.outcomes);

        return new ManualCraft(ingredients, outcomes, recipeData.id, recipeData.id);
    }
}