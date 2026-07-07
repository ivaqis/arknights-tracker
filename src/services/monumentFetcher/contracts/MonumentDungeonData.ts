import { MonumentEnemyData } from "@services/monumentFetcher/contracts/MonumentEnemyData";

export interface MonumentDungeonData {
    id: string;
    name: string;
    isPass: boolean;
    bestRecord: null;
    desc: string;
    feature: string;
    recommendLevel: number;
    enemies: MonumentEnemyData[];
}