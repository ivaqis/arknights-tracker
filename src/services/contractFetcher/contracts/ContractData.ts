import { ContractRecordData } from "@services/contractFetcher/contracts/ContractRecordData";
import { EnemyData } from "@services/contractFetcher/contracts/EnemyData";
import { IndicatorData } from "@services/contractFetcher/contracts/IndicatorData";
import { ContractStatusData } from "@services/skportDetailFetcher/contracts/ContractStatusData";

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