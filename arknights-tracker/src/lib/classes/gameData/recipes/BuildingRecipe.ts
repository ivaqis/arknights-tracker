import type { IBuilding } from "$lib/classes/gameData/buildings/IBuilding";
import type { IItem } from "$lib/classes/gameData/items/IItem";
import type { IItemStack } from "$lib/classes/gameData/items/IItemStack";
import type { IBuildingRecipe } from "$lib/classes/gameData/recipes/IBuildingRecipe";
import { Recipe } from "$lib/classes/gameData/recipes/Recipe";

export class BuildingRecipe<TBuilding extends IBuilding, TIngredient extends IItem, TOutcome extends IItem>
    extends Recipe<TIngredient, TOutcome>
    implements IBuildingRecipe<TBuilding, TIngredient, TOutcome> {

    private readonly _building: TBuilding;
    private readonly _processTimeMs: number;

    public constructor(ingredients: readonly IItemStack<TIngredient>[], outcomes: readonly IItemStack<TOutcome>[], building: TBuilding, processTimeMs: number) {
        super(ingredients, outcomes);

        this._building = building;
        this._processTimeMs = processTimeMs;
    }

    public get building(): TBuilding {
        return this._building;
    }

    public get processTimeMs(): number {
        return this._processTimeMs;
    }
}