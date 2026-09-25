import type { BuildingType } from "$lib/classes/gameData/buildings/BuildingType";
import type { IGameData } from "$lib/classes/gameData/IGameData";
import type { IItem } from "$lib/classes/gameData/items/IItem";
import type { IImageIcon } from "$lib/classes/icons/IImageIcon";
import type { ITextable } from "$lib/classes/ITextable";

export interface IBuilding extends IGameData, ITextable {
    get icon(): IImageIcon;
    get item(): IItem;
    get type(): BuildingType;
}