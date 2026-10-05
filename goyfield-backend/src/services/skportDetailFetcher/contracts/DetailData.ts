import { BaseData } from "@services/skportDetailFetcher/contracts/BaseData.js";
import { CharData } from "@services/skportDetailFetcher/contracts/CharData.js";
import { ContractStatusData } from "@services/skportDetailFetcher/contracts/ContractStatusData.js";
import { MonumentData } from "@services/skportDetailFetcher/contracts/MonumentData.js";

export interface AchieveMedalData {
    achievementData: {
        id: string;
        name: string;
        initIcon: string;
        reforge2Icon: string;
        reforge3Icon: string;
        platedIcon: string;
        cateName: string;
        canCertify: boolean;
        cate: string;
        initLevel: number;
    };
    level: number;
    isPlated: boolean;
    obtainTs: string;
}

export interface AchieveData {
    achieveMedals: AchieveMedalData[];
    display?: Record<string, string>;
    count?: number;
}

export interface DetailData {
    base: BaseData;
    chars: CharData[];
    dungeon: {
        curStamina: string;
        maxTs: string;
        maxStamina: string;
    };
    bpSystem: {
        curLevel: number;
        maxLevel: number;
    };
    dailyMission: {
        dailyActivation: number;
        maxDailyActivation: number;
    };
    weeklyMission: {
        score: number;
        total: number;
    };
    currentTs: string;
    indieHard: {
        indieHardGroups: MonumentData[];
    };
    seekSuspicion: {
        count: number;
        total: number;
    };
    crisisContract: ContractStatusData[];
    achieve?: AchieveData;
}