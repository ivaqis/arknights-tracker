import { BannerType } from "@models/banners/BannerType";

export interface ImportRequest {
    id: string | null;
    token: string;
    serverIds: string[];
    lastPullTimes: Partial<Record<BannerType, string>>;
}