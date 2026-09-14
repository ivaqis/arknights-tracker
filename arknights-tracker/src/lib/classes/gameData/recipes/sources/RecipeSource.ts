import { RecipeType } from "$lib/classes/gameData/recipes/RecipeType";
import type { IRecipeSource } from "$lib/classes/gameData/recipes/sources/IRecipeSource";
import type { ISvgIcon } from "$lib/classes/icons/ISvgIcon";

export class RecipeSource implements IRecipeSource {
    public static readonly HUB: RecipeSource = new RecipeSource({iconId: "pba"}, "hub");
    public static readonly MANUAL: RecipeSource = new RecipeSource({iconId: "recepies"}, "manual");

    private readonly _icon: ISvgIcon;
    private readonly _i18nKey: string;

    private constructor(icon: ISvgIcon, localeKey: string) {
        this._icon = icon;
        this._i18nKey = `formulaSidebar.craftSource.${localeKey}`;
    }

    public static get(recipeType: RecipeType.MANUAL | RecipeType.HUB): RecipeSource {
        switch (recipeType) {
            case RecipeType.MANUAL: return this.MANUAL;
            case RecipeType.HUB: return this.HUB;
        }
    }

    public get i18nKey(): string {
        return this._i18nKey;
    }

    public get icon(): ISvgIcon {
        return this._icon;
    }
}