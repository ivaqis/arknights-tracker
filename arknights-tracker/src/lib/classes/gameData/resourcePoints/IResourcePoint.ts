import type { IGameData } from "$lib/classes/gameData/IGameData";
import type { IItem } from "$lib/classes/gameData/items/IItem";
import type { ResourcePointType } from "$lib/classes/gameData/resourcePoints/ResourcePointType";
import type { IImageIcon } from "$lib/classes/icons/IImageIcon";
import type { ITextable } from "$lib/classes/ITextable";

export interface IResourcePoint<TItem extends IItem = IItem> extends IGameData, ITextable {
    get item(): TItem;
    get bgIcon(): IImageIcon;
    get type(): ResourcePointType;
}