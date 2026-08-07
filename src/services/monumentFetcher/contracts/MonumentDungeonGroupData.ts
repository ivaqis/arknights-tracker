import { MonumentDungeonData } from "@services/monumentFetcher/contracts/MonumentDungeonData.js";

export interface MonumentDungeonGroupData {
    normalDungeon: MonumentDungeonData;
    hardDungeon: MonumentDungeonData;
}