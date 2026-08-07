import { Character } from "@models/gameProfile/Character.js";
import { MonumentDungeonGroup } from "@models/monument/MonumentDungeonGroup.js";
import { MonumentRecord } from "@models/monument/MonumentRecord.js";
import { MonumentDungeonGroupData } from "@services/monumentFetcher/contracts/MonumentDungeonGroupData.js";
import { MonumentGroupData } from "@services/monumentFetcher/contracts/MonumentGroupData.js";

export class MonumentGroup {
    private readonly _dungeonGroups: MonumentDungeonGroup[];

    private constructor(dungeonGroups: MonumentDungeonGroup[]) {
        this._dungeonGroups = dungeonGroups;
    }

    public static getFromData(data: MonumentGroupData, profileChars: Character[]): MonumentGroup {
        return new MonumentGroup(
            this.getList(data.dungeonGroups, profileChars)
        );
    }

    public static getFromDataList(list: MonumentGroupData[], profileChars: Character[]): MonumentGroup[] {
        const result: MonumentGroup[] = [];

        for (const data of list) {
            let group = this.getFromData(data, profileChars);

            result.push(group);
        }

        return result;
    }

    public static getRecordsFromList(list: MonumentGroup[]): MonumentRecord[] {
        const result: MonumentRecord[] = [];

        for (const item of list) {
            let records = item.getAllRecords();

            result.push(...records);
        }

        return result;
    }

    private static getList(list: MonumentDungeonGroupData[], profileChars: Character[]): MonumentDungeonGroup[] {
        const result: MonumentDungeonGroup[] = [];

        for (const item of list) {
            let group = MonumentDungeonGroup.getFromData(item, profileChars);

            result.push(group);
        }

        return result;
    }

    public get dungeonGroups(): MonumentDungeonGroup[] {
        return this._dungeonGroups;
    }

    public getAllRecords(): MonumentRecord[] {
        const result: MonumentRecord[] = [];

        for (const dungeonGroup of this._dungeonGroups) {
            result.push(...dungeonGroup.getAll());
        }

        return result;
    }
}