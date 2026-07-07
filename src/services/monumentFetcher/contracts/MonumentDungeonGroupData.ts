import { MonumentDungeonData } from "@services/monumentFetcher/contracts/MonumentDungeonData";

export interface MonumentDungeonGroupData {
    normalDungeon: MonumentDungeonData;
    hardDungeon: MonumentDungeonData;
}