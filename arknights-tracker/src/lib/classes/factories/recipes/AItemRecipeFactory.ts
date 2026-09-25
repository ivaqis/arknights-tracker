import type { IRecipeFactory } from "$lib/classes/factories/recipes/IRecipeFactory";
import type { IItem } from "$lib/classes/gameData/items/IItem";
import type { IItemStack } from "$lib/classes/gameData/items/IItemStack";
import type { ItemStackData } from "$lib/classes/gameData/items/ItemStackData";
import type { IRecipe } from "$lib/classes/gameData/recipes/IRecipe";
import type { IItemStorage } from "$lib/classes/storages/items/IItemStorage";
import type { RecipeData } from "$lib/data/types/crafts/RecipeData";

export abstract class AItemRecipeFactory<
    TData extends RecipeData,
    TRecipe extends IRecipe<TIngredient, TOutcome>,
    TIngredient extends IItem = IItem,
    TOutcome extends IItem = IItem
>
    implements IRecipeFactory<TData, TRecipe, TIngredient, TOutcome> {

    protected readonly _itemStorage: IItemStorage;

    protected constructor(itemStorage: IItemStorage) {
        this._itemStorage = itemStorage;
    }

    public abstract create(recipeData: TData): TRecipe;

    protected getItemStack(itemStackData: ItemStackData): IItemStack {
        const item = this._itemStorage.byGameId.getOrThrow(itemStackData.itemId);

        return {
            item,
            count: itemStackData.count
        };
    }

    protected getItemStackList(itemStackDataList: readonly ItemStackData[]): IItemStack[] {
        return itemStackDataList.map(data => this.getItemStack(data));
    }
}