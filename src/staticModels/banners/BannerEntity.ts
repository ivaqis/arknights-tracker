import { BannerItemEntity } from "@staticModels/banners/BannerItemEntity.js";

export interface BannerEntity {
    readonly id: string,
    readonly name: string,
    readonly type: string,
    readonly dbType: string,
    readonly startTime: string,
    readonly endTime: string | null,
    readonly startTimeAsia: string,
    readonly endTimeAsia: string | null,
    readonly featured: string[],
    readonly hardGuaranteed: string[],
    readonly allowed: BannerItemEntity[]
}