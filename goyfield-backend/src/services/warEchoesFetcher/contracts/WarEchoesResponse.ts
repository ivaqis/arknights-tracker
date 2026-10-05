import { WarEchoesSeasonData } from "@services/warEchoesFetcher/contracts/WarEchoesSeasonData.js";

export interface WarEchoesResponse {
    code: number;
    message: string;
    timestamp: string;
    data: {
        warEchoes: {
            seasons: WarEchoesSeasonData[];
            achieves?: unknown[];
            activity?: unknown;
        };
    };
}
