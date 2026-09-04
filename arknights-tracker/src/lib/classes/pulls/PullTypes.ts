export interface PullRecord {
    id: string;
    time: Date;
    name: string;
    rarity: number;
    bannerId: string;
    seqId: number;
    isNew?: boolean;
    isFree?: boolean;
    isGuaranteed?: boolean;
    type?: string;
    rawPoolId?: string;
    status?: "won" | "lost" | "guaranteed";
    pity?: number;
}

export interface MileageData {
    show: boolean;
    current: number;
    max: number;
    label: string;
}

export interface WinRateData {
    won: number;
    total: number;
    percent: number | string;
}

export interface BannerStatsResult {
    total: number;
    pity6: number;
    pity5: number;
    mileage: MileageData;
    guarantee120: number;
    hasReceivedRateUp: boolean;
    count6: number;
    count5: number;
    avg6: string;
    avg5: string;
    percent6: string;
    percent5: string;
    winRate: WinRateData;
}

export interface LcsMatchRecord {
    oldPull: PullRecord;
    newPull: PullRecord;
}
