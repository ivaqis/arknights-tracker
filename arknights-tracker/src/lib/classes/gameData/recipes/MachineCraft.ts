import type { ICrafter } from "$lib/classes/gameData/buildings/crafters/ICrafter";
import type { ICrafterModeGroup } from "$lib/classes/gameData/buildings/crafters/ICrafterModeGroup";
import type { IGasEnv } from "$lib/classes/gameData/gasEnv/IGasEnv";
import type { IItem } from "$lib/classes/gameData/items/IItem";
import type { IItemStack } from "$lib/classes/gameData/items/IItemStack";
import { BuildingRecipe } from "$lib/classes/gameData/recipes/BuildingRecipe";
import type { IMachineCraft } from "$lib/classes/gameData/recipes/IMachineCraft";

export class MachineCraft extends BuildingRecipe<ICrafter, IItem, IItem> implements IMachineCraft {
    private readonly _formulaGroup: ICrafterModeGroup;
    private readonly _gameId: string;
    private readonly _id: string;
    private readonly _consumeGasEnv: IGasEnv | null;

    public constructor(ingredients: IItemStack[], outcomes: IItemStack[], building: ICrafter, processTimeMs: number, formulaGroup: ICrafterModeGroup, gameId: string, id: string, consumeGasEnv: IGasEnv | null) {
        super(ingredients, outcomes, building, processTimeMs);

        this._formulaGroup = formulaGroup;
        this._gameId = gameId;
        this._id = id;
        this._consumeGasEnv = consumeGasEnv;
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

    public get consumeGasEnv(): IGasEnv | null {
        return this._consumeGasEnv;
    }
}