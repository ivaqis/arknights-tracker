import type { BannerItemData } from "$lib/classes/banners/BannerItemData";

export interface BannerGameData {
    readonly id: string;
    readonly name: string;
    readonly type: string;
    readonly dbType: string;
    readonly startTime: string;
    readonly endTime: string | null;
    readonly startTimeAsia: string;
    readonly endTimeAsia: string | null;
    readonly featured: readonly string[];
    readonly hardGuaranteed: readonly string[];
    readonly allowed: readonly BannerItemData[];
}