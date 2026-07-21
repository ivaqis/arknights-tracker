import { BannerType } from "@models/banners/BannerType";

export interface ImportProgressResponse {
    type: BannerType;
    count: number;
}