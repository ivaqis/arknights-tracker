import { WarEchoesDungeonGroupData } from "@services/warEchoesFetcher/contracts/WarEchoesDungeonGroupData.js";

export interface WarEchoesWeekData {
    id: string;
    name: string;
    startTs?: string;
    endTs?: string;
    stars?: number;
    allPlusTasks?: boolean;
    dungeonGroups: WarEchoesDungeonGroupData[];
}
