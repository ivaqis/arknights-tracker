import type { IGasEnv } from "$lib/classes/gameData/gasEnv/IGasEnv";
import type { IBgColoredSvgIcon } from "$lib/classes/icons/IBgColoredSvgIcon";
import type { GasEnvData } from "$lib/data/types/items/GasEnvData";

export class GasEnv implements IGasEnv {
    private readonly _id: string;
    private readonly _icon: IBgColoredSvgIcon;

    public constructor(id: string, icon: IBgColoredSvgIcon) {
        this._id = id;
        this._icon = icon;
    }

    public static createFromData(data: GasEnvData): GasEnv {
        const icon: IBgColoredSvgIcon = {
            iconId: data.icon.id,
            color: data.icon.color,
            bgColor: data.icon.bgColor,
        };

        return new GasEnv(
            data.id,
            icon
        );
    }

    public get id(): string {
        return this._id;
    }

    public get icon(): IBgColoredSvgIcon {
        return this._icon;
    }

    public get i18nKey(): string {
        return `gasEnv.${this._id}`;
    }
}