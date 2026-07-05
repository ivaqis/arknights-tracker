import { DetailData } from "@services/skportDetailFetcher/contracts/DetailData";

export interface SkportDetailResponse {
    code: number;
    message: string;
    timestamp: string;
    data: {
        detail: DetailData;
    }
}