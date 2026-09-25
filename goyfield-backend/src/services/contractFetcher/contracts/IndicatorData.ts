export interface IndicatorData {
    id: string;
    icon: string;
    name: string;
    desc: string;
    descParams: {
        attr: string;
    };
    hasAward: boolean;
    type: number;
    depends: any[];
    openTs: string;
    score: number;
    isUnlock: boolean;
    unlockScore: number;
}
