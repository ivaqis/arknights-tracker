import { GameData } from "@services/skportBindingFetcher/contracts/GameData.js";

export interface BindingResponse {
    code: number,
    message: string,
    timestamp: string,
    data: {
        list: GameData[],
        serverDefaultBinding: object
    }
}