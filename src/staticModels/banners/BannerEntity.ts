import { BannerItemEntity } from "@staticModels/banners/BannerItemEntity";

export interface BannerEntity {
    id: string,
    name: string,
    type: string,
    dbType: string,
    startTime: string,
    endTime: string | null,
    startTimeAsia: string,
    endTimeAsia: string | null,
    featured: string[],
    hardGuaranteed: string[],
    allowed: BannerItemEntity[]
}