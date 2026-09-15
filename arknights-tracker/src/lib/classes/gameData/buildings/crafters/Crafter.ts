import { Building } from "$lib/classes/gameData/buildings/Building";
import type { BuildingType } from "$lib/classes/gameData/buildings/BuildingType";
import type { IBuilding } from "$lib/classes/gameData/buildings/IBuilding";
import type { ICrafter } from "$lib/classes/gameData/buildings/crafters/ICrafter";
import type { ICrafterModeGroup } from "$lib/classes/gameData/buildings/crafters/ICrafterModeGroup";
import type { IItem } from "$lib/classes/gameData/items/IItem";
import type { IImageIcon } from "$lib/classes/icons/IImageIcon";

export class Crafter extends Building implements ICrafter {
    private readonly _modes: readonly ICrafterModeGroup[];

    public constructor(id: string, gameId: string, type: BuildingType, item: IItem, icon: IImageIcon, modes: readonly ICrafterModeGroup[]) {
        super(id, gameId, type, item, icon);
        this._modes = modes;
    }

    public static createFromBuilding(building: IBuilding, modes: readonly ICrafterModeGroup[]): Crafter {
        return new Crafter(
            building.id,
            building.gameId,
            building.type,
            building.item,
            building.icon,
            modes
        );
    }

    public get modes(): readonly ICrafterModeGroup[] {
        return this._modes;
    }
}