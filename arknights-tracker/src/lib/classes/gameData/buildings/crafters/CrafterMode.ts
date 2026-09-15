import { CrafterModeName } from "$lib/classes/gameData/buildings/crafters/CrafterModeName";
import type { ICrafterMode } from "$lib/classes/gameData/buildings/crafters/ICrafterMode";
import type { ISvgIcon } from "$lib/classes/icons/ISvgIcon";

export class CrafterMode implements ICrafterMode {
    public static readonly NORMAL       = this.create(CrafterModeName.NORMAL);
    public static readonly LIQUID       = this.create(CrafterModeName.LIQUID);
    public static readonly GAS          = this.create(CrafterModeName.GAS);
    public static readonly GAS_LIQUID   = this.create(CrafterModeName.GAS_LIQUID);
    public static readonly GAS_TRANS    = this.create(CrafterModeName.GAS_TRANS);
    public static readonly LIQUID_TRANS = this.create(CrafterModeName.LIQUID_TRANS);
    public static readonly SOLID_TRANS  = this.create(CrafterModeName.SOLID_TRANS);

    private readonly _name: CrafterModeName;
    private readonly _icon: ISvgIcon;

    private constructor(name: CrafterModeName, icon: ISvgIcon) {
        this._name = name;
        this._icon = icon;
    }

    public static get(name: CrafterModeName): CrafterMode {
        switch (name) {
            case CrafterModeName.NORMAL:       return this.NORMAL;
            case CrafterModeName.LIQUID:       return this.LIQUID;
            case CrafterModeName.GAS:          return this.GAS;
            case CrafterModeName.GAS_LIQUID:   return this.GAS_LIQUID;
            case CrafterModeName.GAS_TRANS:    return this.GAS_TRANS;
            case CrafterModeName.LIQUID_TRANS: return this.LIQUID_TRANS;
            case CrafterModeName.SOLID_TRANS:  return this.SOLID_TRANS;
        }
    }

    private static create(name: CrafterModeName): CrafterMode {
        return new CrafterMode(
            name,
            { iconId: this.getIconId(name) }
        );
    }

    private static getIconId(name: CrafterModeName): string {
        switch (name) {
            case CrafterModeName.NORMAL:       return "boxes";
            case CrafterModeName.LIQUID:       return "liquid";
            case CrafterModeName.GAS:          return "port_gas";
            case CrafterModeName.GAS_LIQUID:   return "port_gasliquid";
            case CrafterModeName.GAS_TRANS:    return "port_gastrans";
            case CrafterModeName.LIQUID_TRANS: return "port_liquidtrans";
            case CrafterModeName.SOLID_TRANS:  return "port_solidtrans";
        }
    }

    public get i18nKey(): string {
        return `buildingModes.${this._name}`;
    }

    public get icon(): ISvgIcon {
        return this._icon;
    }

    public get name(): CrafterModeName {
        return this._name;
    }
}