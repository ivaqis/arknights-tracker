import { MonumentDungeonData } from "@services/skportDetailFetcher/contracts/MonumentDungeonData.js";

export interface MonumentDungeonGroupData {
    normalDungeon: MonumentDungeonData;
    hardDungeon: MonumentDungeonData;
}