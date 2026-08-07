import { PullData } from "@services/bannerDataFetcher/entities/PullData.js";

export interface BannerResponse<T extends PullData> {
    code: number,
    data: {
        list: T[],
        hasMore: boolean
    },
    msg: string
}