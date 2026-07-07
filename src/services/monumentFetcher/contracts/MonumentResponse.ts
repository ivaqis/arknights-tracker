import { MonumentGroupData } from "@services/monumentFetcher/contracts/MonumentGroupData";

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