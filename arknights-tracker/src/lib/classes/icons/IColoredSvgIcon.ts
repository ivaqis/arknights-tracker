import type { ISvgIcon } from "$lib/classes/icons/ISvgIcon";

export interface IColoredSvgIcon extends ISvgIcon {
    readonly color: string;
    readonly colorDark?: string | null;
}