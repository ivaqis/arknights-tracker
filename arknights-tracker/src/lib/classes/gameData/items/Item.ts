import type { IItem } from "$lib/classes/gameData/items/IItem";
import { type ItemGroup } from "$lib/classes/gameData/items/ItemGroup";
import { type ItemMaterial } from "$lib/classes/gameData/items/ItemMaterial";
import { type ItemType } from "$lib/classes/gameData/items/ItemType";
import type { IImageIcon } from "$lib/classes/icons/IImageIcon";
import { ImageVariant } from "$lib/classes/icons/ImageVariant";
import type { Rarity } from "$lib/classes/Rarity";
import type { ItemData } from "$lib/data/types/items/ItemData";

export class Item implements IItem {
    private readonly _id: string;
    private readonly _gameId: string;
    private readonly _rarity: Rarity;
    private readonly _groupId: ItemGroup;
    private readonly _type: ItemType;
    private readonly _material: ItemMaterial | null;
    private readonly _icon: IImageIcon;
    private readonly _subIcon: IImageIcon | null;

    public constructor(id: string, gameId: string, rarity: Rarity, groupId: ItemGroup, type: ItemType, itemMaterial: ItemMaterial | null, icon: IImageIcon, subIcon: IImageIcon | null) {
        this._id = id;
        this._gameId = gameId;
        this._rarity = rarity;
        this._groupId = groupId;
        this._type = type;
        this._material = itemMaterial;
        this._icon = icon;
        this._subIcon = subIcon;
    }

    public static createItemFromData(data: ItemData, subIcon: IImageIcon | null = null): Item {
        const icon: IImageIcon = {
            iconId: data.iconId,
            imageVariant: ImageVariant.ITEM_ICON
        };

        return new Item(
            data.id,
            data.id,
            data.rarity,
            data.groupId as ItemGroup,
            data.type as ItemType,
            data.material as ItemMaterial | null,
            icon,
            subIcon
        );
    }

    public get id(): string {
        return this._id;
    }

    public get gameId(): string {
        return this._gameId;
    }

    public get groupId(): ItemGroup {
        return this._groupId;
    }

    public get icon(): IImageIcon {
        return this._icon;
    }

    public get material(): ItemMaterial | null {
        return this._material
    }

    public get rarity(): Rarity {
        return this._rarity;
    }

    public get type(): ItemType {
        return this._type;
    }

    public get subIcon(): IImageIcon | null {
        return this._subIcon;
    }

    public get i18nKey(): string {
        return `itemNames.${this.gameId}`;
    }
}