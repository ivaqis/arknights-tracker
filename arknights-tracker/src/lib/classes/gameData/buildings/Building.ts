import { type BuildingType } from "$lib/classes/gameData/buildings/BuildingType";
import type { IBuilding } from "$lib/classes/gameData/buildings/IBuilding";
import { GameData } from "$lib/classes/gameData/GameData";
import type { IItem } from "$lib/classes/gameData/items/IItem";
import type { IImageIcon } from "$lib/classes/icons/IImageIcon";
import { ImageVariant } from "$lib/classes/icons/ImageVariant";
import type { BuildingData } from "$lib/data/types/buildings/BuildingData";

export class Building extends GameData implements IBuilding {
    private readonly _type: BuildingType;
    private readonly _item: IItem;
    private readonly _icon: IImageIcon;

    public constructor(id: string, gameId: string, type: BuildingType, item: IItem, icon: IImageIcon) {
        super(id, gameId);

        this._type = type;
        this._item = item;
        this._icon = icon;
    }

    public static createFromData(buildingData: BuildingData, item: IItem): Building {
        const icon: IImageIcon = {
            iconId: buildingData.iconId,
            imageVariant: ImageVariant.BUILDING_ICON
        };

        return new Building(
            buildingData.id,
            buildingData.id,
            buildingData.type as BuildingType,
            item,
            icon
        );
    }

    public get i18nKey(): string {
        return `buildingNames.${this.gameId}`;
    }

    public get icon(): IImageIcon {
        return this._icon;
    }

    public get item(): IItem {
        return this._item;
    }

    public get type(): BuildingType {
        return this._type;
    }
}