import { ContractRecordData } from "@services/contractFetcher/contracts/ContractRecordData.js";
import { EnemyData } from "@services/contractFetcher/contracts/EnemyData.js";
import { IndicatorData } from "@services/contractFetcher/contracts/IndicatorData.js";
import { ContractStatusData } from "@services/skportDetailFetcher/contracts/ContractStatusData.js";

export interface ContractData {
    status: ContractStatusData;
    history: {
        records: ContractRecordData[];
        bestRecord?: ContractRecordData;
    };
    indicators: IndicatorData[];
    dungeon: {
        id: string;
        name: string;
        desc: string;
        recommendLevel: number;
        enemies: EnemyData[];
    }
}