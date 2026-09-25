import { MonumentDungeonGroupData } from "@services/skportDetailFetcher/contracts/MonumentDungeonGroupData.js";

export interface MonumentData {
    id: string;
    name: string;
    activityStartTs: string;
    activityEndTs: string;
    activityName: string;
    isInActivity: boolean;
    dungeonGroups: MonumentDungeonGroupData[];
}