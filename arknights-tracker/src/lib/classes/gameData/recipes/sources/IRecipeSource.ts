import type { ISvgIcon } from "$lib/classes/icons/ISvgIcon";
import type { ITextable } from "$lib/classes/ITextable";

export interface IRecipeSource extends ITextable {
    get icon(): ISvgIcon;
}