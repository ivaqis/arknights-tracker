import type { ICrafter } from "$lib/classes/gameData/buildings/crafters/ICrafter";
import type { ICrafterModeGroup } from "$lib/classes/gameData/buildings/crafters/ICrafterModeGroup";
import type { IItem } from "$lib/classes/gameData/items/IItem";
import type { IItemStack } from "$lib/classes/gameData/items/IItemStack";
import { BuildingRecipe } from "$lib/classes/gameData/recipes/BuildingRecipe";
import type { IMachineCraft } from "$lib/classes/gameData/recipes/IMachineCraft";

export class MachineCraft extends BuildingRecipe<ICrafter, IItem, IItem> implements IMachineCraft {
    private readonly _formulaGroup: ICrafterModeGroup;
    private readonly _gameId: string;
    private readonly _id: string;

    public constructor(ingredients: IItemStack[], outcomes: IItemStack[], building: ICrafter, processTimeMs: number, formulaGroup: ICrafterModeGroup, gameId: string, id: string) {
        super(ingredients, outcomes, building, processTimeMs);

        this._formulaGroup = formulaGroup;
        this._gameId = gameId;
        this._id = id;
    }

    public get gameId(): string {
        return this._gameId;
    }

    public get id(): string {
        return this._id;
    }

    public get formulaGroup(): ICrafterModeGroup {
        return this._formulaGroup;
    }
}