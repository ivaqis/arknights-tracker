export interface ApiBannerTypeData {
    id: string;
    gameType: string;
    name?: string;
    i18nKey: string;
    order: number;
    showOnHome: boolean;
    showInRating: boolean;
    color?: string;
}

declare const bannerTypes: ApiBannerTypeData[];