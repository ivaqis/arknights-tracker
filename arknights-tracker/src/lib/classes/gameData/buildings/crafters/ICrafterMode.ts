import type { CrafterModeName } from "$lib/classes/gameData/buildings/crafters/CrafterModeName";
import type { ISvgIcon } from "$lib/classes/icons/ISvgIcon";
import type { ITextable } from "$lib/classes/ITextable";

export interface ICrafterMode extends ITextable {
    get name(): CrafterModeName;
    get icon(): ISvgIcon;
}