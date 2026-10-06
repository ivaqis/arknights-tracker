import { WarEchoesWeekData } from "@services/warEchoesFetcher/contracts/WarEchoesWeekData.js";

export interface WarEchoesSeasonData {
    id: string;
    name: string;
    kvImage?: string;
    headerImage?: string;
    startTs?: string;
    endTs?: string;
    stars?: number;
    allPlusTasks?: boolean;
    weeks: WarEchoesWeekData[];
}
