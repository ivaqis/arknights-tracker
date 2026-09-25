import type { IGasEnv } from "$lib/classes/gameData/gasEnv/IGasEnv";
import type { IItem } from "$lib/classes/gameData/items/IItem";

export interface IVaporizerGroup {
    get consumeItem(): IItem;
    get consumeRate(): number;
    get maxConsumeRate(): number;
    get gasEnv(): IGasEnv;
}