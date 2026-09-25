import { AItemRecipeFactory } from "$lib/classes/factories/recipes/AItemRecipeFactory";
import type { IMachineCraftFactory } from "$lib/classes/factories/recipes/IMachineCraftFactory";
import type { IGasEnv } from "$lib/classes/gameData/gasEnv/IGasEnv";
import type { IMachineCraft } from "$lib/classes/gameData/recipes/IMachineCraft";
import { MachineCraft } from "$lib/classes/gameData/recipes/MachineCraft";
import type { ICrafterStorage } from "$lib/classes/storages/buildings/ICrafterStorage";
import type { IDataStorage } from "$lib/classes/storages/IDataStorage";
import type { IItemStorage } from "$lib/classes/storages/items/IItemStorage";
import type { MachineCraftData } from "$lib/data/types/crafts/MachineCraftData";

export class MachineCraftFactory
    extends AItemRecipeFactory<MachineCraftData, IMachineCraft>
    implements IMachineCraftFactory {

    private readonly _crafterStorage: ICrafterStorage;
    private readonly _gasEnvStorage: IDataStorage<IGasEnv>;

    public constructor(itemStorage: IItemStorage, crafterStorage: ICrafterStorage, gasEnvStorage: IDataStorage<IGasEnv>) {
        super(itemStorage);

        this._crafterStorage = crafterStorage;
        this._gasEnvStorage = gasEnvStorage;
    }

    public create(recipeData: MachineCraftData): IMachineCraft {
        const ingredients = this.getItemStackList(recipeData.ingredients);
        const outcomes = this.getItemStackList(recipeData.outcomes);
        const crafter = this._crafterStorage.byGameId.getOrThrow(recipeData.buildingId);
        const formulaGroup = crafter.modes.find(item => item.formulaGroupId === recipeData.formulaGroupId);

        if (!formulaGroup) {
            throw new Error(`Formula group id ${recipeData.formulaGroupId} for crafter ${crafter.gameId} not found`);
        }

        const gasEnv = recipeData.gasEnv ? this._gasEnvStorage.byId.getOrThrow(recipeData.gasEnv) : null;

        return new MachineCraft(
            ingredients,
            outcomes,
            crafter,
            recipeData.craftTimeMs,
            formulaGroup,
            recipeData.id,
            recipeData.id,
            gasEnv
        );
    }
}