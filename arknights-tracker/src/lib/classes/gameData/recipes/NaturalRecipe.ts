import type { IBuilding } from "$lib/classes/gameData/buildings/IBuilding";
import type { IItem } from "$lib/classes/gameData/items/IItem";
import type { IItemStack } from "$lib/classes/gameData/items/IItemStack";
import { BuildingRecipe } from "$lib/classes/gameData/recipes/BuildingRecipe";
import type { INaturalRecipe } from "$lib/classes/gameData/recipes/INaturalRecipe";
import type { IResourcePoint } from "$lib/classes/gameData/resourcePoints/IResourcePoint";

export class NaturalRecipe<TBuilding extends IBuilding, TIngredient extends IItem, TOutcome extends IItem>
    extends BuildingRecipe<TBuilding, TIngredient, TOutcome>
    implements INaturalRecipe<TBuilding, TIngredient, TOutcome> {

    private readonly _resourcePoint: IResourcePoint;

    public constructor(ingredients: readonly IItemStack<TIngredient>[], outcomes: readonly IItemStack<TOutcome>[], building: TBuilding, processTimeMs: number, resourcePoint: IResourcePoint) {
        super(ingredients, outcomes, building, processTimeMs);

        this._resourcePoint = resourcePoint;
    }

    public get resourcePoint(): IResourcePoint {
        return this._resourcePoint;
    }
}