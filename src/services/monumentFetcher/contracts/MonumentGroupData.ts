import { MonumentDungeonGroupData } from "@services/monumentFetcher/contracts/MonumentDungeonGroupData";

export interface MonumentGroupData {
    id: string;
    name: string;
    pic: string;
    activityStartTs: string;
    activityEndTs: string;
    activityName: string;
    isInActivity: boolean;
    dungeonGroups: MonumentDungeonGroupData[];
}