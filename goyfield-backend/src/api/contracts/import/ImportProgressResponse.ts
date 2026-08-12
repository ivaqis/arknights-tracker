import { BannerType } from "@models/banners/BannerType.js";

export interface ImportProgressResponse {
    type: BannerType;
    count: number;
}