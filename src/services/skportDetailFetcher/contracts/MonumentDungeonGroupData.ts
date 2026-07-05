import { MonumentDungeonData } from "@services/skportDetailFetcher/contracts/MonumentDungeonData";

export interface MonumentDungeonGroupData {
    normalDungeon: MonumentDungeonData;
    hardDungeon: MonumentDungeonData;
}