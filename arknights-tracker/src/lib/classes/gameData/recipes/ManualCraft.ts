import type { IItem } from "$lib/classes/gameData/items/IItem";
import type { IItemStack } from "$lib/classes/gameData/items/IItemStack";
import type { IManualCraft } from "$lib/classes/gameData/recipes/IManualCraft";
import { Recipe } from "$lib/classes/gameData/recipes/Recipe";

export class ManualCraft extends Recipe<IItem, IItem> implements IManualCraft {
    private readonly _gameId: string;
    private readonly _id: string;

    public constructor(ingredients: IItemStack[], outcomes: IItemStack[], gameId: string, id: string) {
        super(ingredients, outcomes);
        this._gameId = gameId;
        this._id = id;
    }

    public get gameId(): string {
        return this._gameId;
    }

    public get id(): string {
        return this._id;
    }
}