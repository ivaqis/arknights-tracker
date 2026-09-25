import type { IColoredSvgIcon } from "$lib/classes/icons/IColoredSvgIcon";

export interface IBgColoredSvgIcon extends IColoredSvgIcon {
    readonly bgColor: string;
    readonly bgColorDark?: string | null;
}