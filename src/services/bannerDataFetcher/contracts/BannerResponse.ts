import { PullData } from "@services/bannerDataFetcher/entities/PullData";

export interface BannerResponse<T extends PullData> {
    code: number,
    data: {
        list: T[],
        hasMore: boolean
    },
    msg: string
}