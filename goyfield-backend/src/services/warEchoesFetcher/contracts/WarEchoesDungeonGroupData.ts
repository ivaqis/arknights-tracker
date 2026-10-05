import { WarEchoesDungeonData } from "@services/warEchoesFetcher/contracts/WarEchoesDungeonData.js";

export interface WarEchoesDungeonGroupData {
    star?: number;
    plusTask?: boolean;
    name: string;
    normalDungeon: WarEchoesDungeonData;
    hardDungeon: WarEchoesDungeonData;
    cruelDungeon: WarEchoesDungeonData;
}
