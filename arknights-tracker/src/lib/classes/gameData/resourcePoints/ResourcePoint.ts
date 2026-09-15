import { GameData } from "$lib/classes/gameData/GameData";
import type { IItem } from "$lib/classes/gameData/items/IItem";
import type { IResourcePoint } from "$lib/classes/gameData/resourcePoints/IResourcePoint";
import { ResourcePointBgIcon } from "$lib/classes/gameData/resourcePoints/ResourcePointBgIcon";
import { ResourcePointType } from "$lib/classes/gameData/resourcePoints/ResourcePointType";
import type { IImageIcon } from "$lib/classes/icons/IImageIcon";
import type { ResourcePointData } from "$lib/data/types/items/ResourcePointData";

export class ResourcePoint extends GameData implements IResourcePoint {
    private readonly _type: ResourcePointType;
    private readonly _item: IItem;
    private readonly _icon: IImageIcon;

    public constructor(id: string, gameId: string, type: ResourcePointType, item: IItem) {
        super(id, gameId);

        this._type = type;
        this._item = item;
        this._icon = ResourcePointBgIcon.get(type);
    }

    public static createFromData(data: ResourcePointData, item: IItem): ResourcePoint {
        return new ResourcePoint(
            data.id,
            data.id,
            data.type as ResourcePointType,
            item
        );
    }

    public get bgIcon(): IImageIcon {
        return this._icon;
    }

    public get i18nKey(): string {
        return `resourcePointNames.${this.id}`;
    }

    public get item(): IItem {
        return this._item;
    }

    public get type(): ResourcePointType {
        return this._type;
    }
}