import type { IData } from "$lib/classes/IData";

export interface GasEnvData extends IData {
    gameId: number;
    icon: {
        id: string;
        color: string;
        bgColor: string;
    };
}