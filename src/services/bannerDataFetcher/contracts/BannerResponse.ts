import { PullEntity } from "@services/bannerDataFetcher/entities/PullEntity";

export interface BannerResponse<T extends PullEntity> {
    code: number,
    data: {
        list: T[],
        hasMore: boolean
    },
    msg: string
}