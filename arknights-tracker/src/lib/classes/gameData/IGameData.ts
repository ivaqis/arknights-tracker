import type { IData } from "$lib/classes/IData";

export interface IGameData extends IData {
    get gameId(): string;
}