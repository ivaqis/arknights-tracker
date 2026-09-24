import type { IBuilding } from "$lib/classes/gameData/buildings/IBuilding";
import type { IVaporizerGroup } from "$lib/classes/gameData/buildings/vaporizers/IVaporizerGroup";

export interface IVaporizer extends IBuilding {
    get groups(): readonly IVaporizerGroup[];

    getGroupByItem(itemId: string): IVaporizerGroup | null;
    getGroupByEnv(gasEnvId: string): IVaporizerGroup | null;
}