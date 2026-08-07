import { DetailData } from "@services/skportDetailFetcher/contracts/DetailData.js";

export interface SkportDetailResponse {
    code: number;
    message: string;
    timestamp: string;
    data: {
        detail: DetailData;
    }
}