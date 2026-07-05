import { BaseData } from "@services/skportDetailFetcher/contracts/BaseData";
import { CharData } from "@services/skportDetailFetcher/contracts/CharData";
import { ContractData } from "@services/skportDetailFetcher/contracts/ContractData";
import { MonumentData } from "@services/skportDetailFetcher/contracts/MonumentData";

export interface DetailData {
    base: BaseData;
    chars: CharData;
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
    crisisContract: ContractData[];
}