import { MonumentEnemyData } from "@services/monumentFetcher/contracts/MonumentEnemyData.js";
import { MonumentRecordData } from "@services/monumentFetcher/contracts/MonumentRecordData.js";

export interface MonumentDungeonData {
    id: string;
    name: string;
    isPass: boolean;
    bestRecord: MonumentRecordData | null;
    desc: string;
    feature: string;
    recommendLevel: number;
    enemies: MonumentEnemyData[];
}