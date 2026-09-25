import { MonumentGroupData } from "@services/monumentFetcher/contracts/MonumentGroupData.js";

export interface MonumentResponse {
    code: number;
    message: string;
    timestamp: string;
    data: {
        indieHard: {
            indieHardGroups: MonumentGroupData[];
        }
    }
}