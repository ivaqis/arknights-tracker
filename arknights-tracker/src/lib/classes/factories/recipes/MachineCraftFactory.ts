import { AItemRecipeFactory } from "$lib/classes/factories/recipes/AItemRecipeFactory";
import type { IMachineCraftFactory } from "$lib/classes/factories/recipes/IMachineCraftFactory";
import type { IMachineCraft } from "$lib/classes/gameData/recipes/IMachineCraft";
import { MachineCraft } from "$lib/classes/gameData/recipes/MachineCraft";
import type { ICrafterStorage } from "$lib/classes/storages/buildings/ICrafterStorage";
import type { IItemStorage } from "$lib/classes/storages/items/IItemStorage";
import type { MachineCraftData } from "$lib/data/types/crafts/MachineCraftData";

export class MachineCraftFactory
    extends AItemRecipeFactory<MachineCraftData, IMachineCraft>
    implements IMachineCraftFactory {

    private readonly _crafterStorage: ICrafterStorage;

    public constructor(itemStorage: IItemStorage, crafterStorage: ICrafterStorage) {
        super(itemStorage);

        this._crafterStorage = crafterStorage;
    }

    public create(recipeData: MachineCraftData): IMachineCraft {
        const ingredients = this.getItemStackList(recipeData.ingredients);
        const outcomes = this.getItemStackList(recipeData.outcomes);
        const crafter = this._crafterStorage.byGameId.getOrThrow(recipeData.buildingId);
        const formulaGroup = crafter.modes.find(item => item.formulaGroupId === recipeData.formulaGroupId);

        if (!formulaGroup) {
            throw new Error(`Formula group id ${recipeData.formulaGroupId} for crafter ${crafter.gameId} not found`);
        }

        return new MachineCraft(
            ingredients,
            outcomes,
            crafter,
            recipeData.craftTimeMs,
            formulaGroup,
            recipeData.id,
            recipeData.id
        );
    }
}