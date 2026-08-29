import type { GameBannerType } from "$lib/classes/banners/GameBannerType";

export interface ImportProgressData {
    type: GameBannerType;
    count: number;
}