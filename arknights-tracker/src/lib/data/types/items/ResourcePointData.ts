import type { ResourcePointType } from "$lib/classes/gameData/resourcePoints/ResourcePointType";
import type { IData } from "$lib/classes/IData";

export interface ResourcePointData extends IData {
    itemId: string;
    type: `${ResourcePointType}`
}