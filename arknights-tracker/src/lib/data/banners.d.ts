export interface BannerData {
    readonly id: string;
    readonly gameId?: string;
    readonly name: string;
    readonly type: string;
    readonly startTime: string;
    readonly endTime: string | null;
    readonly startTimeAsia?: string | null;
    readonly endTimeAsia?: string | null;
    readonly version: string;
    readonly featured6: string[];
    readonly featured5: string[];
    readonly isServerTime: boolean;
    readonly timezone: string;
    readonly icon: string;
    readonly miniIcon: string;
    readonly url: string;
    readonly layer: number | null;
    readonly color: string;
    readonly iconPosition: number;
    readonly showOnMain: boolean;
}

declare const banners: readonly BannerData[];