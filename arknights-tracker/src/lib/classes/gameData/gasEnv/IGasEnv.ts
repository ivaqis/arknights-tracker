import type { IBgColoredSvgIcon } from "$lib/classes/icons/IBgColoredSvgIcon";
import type { IData } from "$lib/classes/IData";
import type { ITextable } from "$lib/classes/ITextable";

export interface IGasEnv extends IData, ITextable {
    icon: IBgColoredSvgIcon;
}