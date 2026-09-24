import { Building } from "$lib/classes/gameData/buildings/Building";
import type { BuildingType } from "$lib/classes/gameData/buildings/BuildingType";
import type { IBuilding } from "$lib/classes/gameData/buildings/IBuilding";
import type { IVaporizer } from "$lib/classes/gameData/buildings/vaporizers/IVaporizer";
import type { IVaporizerGroup } from "$lib/classes/gameData/buildings/vaporizers/IVaporizerGroup";
import type { IItem } from "$lib/classes/gameData/items/IItem";
import type { IImageIcon } from "$lib/classes/icons/IImageIcon";

export class Vaporizer extends Building implements IVaporizer {
    private readonly _groups: readonly IVaporizerGroup[];

    public constructor(id: string, gameId: string, type: BuildingType, item: IItem, icon: IImageIcon, groups: readonly IVaporizerGroup[]) {
        super(id, gameId, type, item, icon);

        this._groups = groups;
    }

    public static createFromBuilding(building: IBuilding, groups: readonly IVaporizerGroup[]): Vaporizer {
        return new Vaporizer(
            building.id,
            building.gameId,
            building.type,
            building.item,
            building.icon,
            groups,
        )
    }

    public get groups(): readonly IVaporizerGroup[] {
        return this._groups;
    }

    public getGroupByEnv(gasEnvId: string): IVaporizerGroup | null {
        return this._groups.find(env => env.gasEnv.id === gasEnvId) ?? null;
    }

    public getGroupByItem(itemId: string): IVaporizerGroup | null {
        return this._groups.find(env => env.consumeItem.gameId === itemId) ?? null;
    }
}