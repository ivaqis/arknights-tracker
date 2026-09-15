import type { IRecipeSearchResult } from "$lib/classes/searchers/recipes/results/IRecipeSearchResult";

export interface IRecipeSearcher<
    TResult extends IRecipeSearchResult
> {
    searchByItemAsIncome(itemId: string): TResult;
    searchByItemAsOutcome(itemId: string): TResult;
}