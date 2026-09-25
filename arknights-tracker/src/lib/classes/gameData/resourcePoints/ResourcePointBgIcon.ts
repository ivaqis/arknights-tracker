import { ResourcePointType } from "$lib/classes/gameData/resourcePoints/ResourcePointType";
import type { IImageIcon } from "$lib/classes/icons/IImageIcon";
import { ImageVariant } from "$lib/classes/icons/ImageVariant";

export class ResourcePointBgIcon implements IImageIcon {
    public static readonly MINE = new ResourcePointBgIcon("item_icon_bg_miner");
    public static readonly LIQUID = new ResourcePointBgIcon("item_icon_bg_liquid");
    public static readonly GAS = new ResourcePointBgIcon("item_icon_bg_gas");

    public readonly iconId: string;
    public readonly imageVariant = ImageVariant.ITEM_ICON_BG;

    private constructor(iconId: string) {
        this.iconId = iconId;
    }

    public static get(type: ResourcePointType): ResourcePointBgIcon {
        switch (type) {
            case ResourcePointType.MINE: return this.MINE;
            case ResourcePointType.LIQUID: return this.LIQUID;
            case ResourcePointType.GAS: return this.GAS;
        }
    }
}