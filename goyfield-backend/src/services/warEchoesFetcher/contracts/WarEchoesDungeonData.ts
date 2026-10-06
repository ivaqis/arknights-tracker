import { WarEchoesEnemyData } from "@services/warEchoesFetcher/contracts/WarEchoesEnemyData.js";
import { WarEchoesRecordData } from "@services/warEchoesFetcher/contracts/WarEchoesRecordData.js";

export interface WarEchoesDungeonData {
    id: string;
    name: string;
    isPass: boolean;
    firstPassTs?: string;
    bestRecord: WarEchoesRecordData | null;
    desc: string;
    feature: string;
    recommendLevel: number;
    plusTask?: boolean;
    additionalChallengeTarget?: string;
    enemies: WarEchoesEnemyData[];
}
