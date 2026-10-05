import { Character } from "@models/gameProfile/Character.js";
import { WarEchoesDungeonGroup } from "@models/warEchoes/WarEchoesDungeonGroup.js";
import { WarEchoesRecord } from "@models/warEchoes/WarEchoesRecord.js";
import { WarEchoesSeasonData } from "@services/warEchoesFetcher/contracts/WarEchoesSeasonData.js";
import { WarEchoesWeekData } from "@services/warEchoesFetcher/contracts/WarEchoesWeekData.js";

export class WarEchoesGroup {
    private readonly _groupId: string;
    private readonly _dungeonGroups: WarEchoesDungeonGroup[];

    private constructor(groupId: string, dungeonGroups: WarEchoesDungeonGroup[]) {
        this._groupId = groupId;
        this._dungeonGroups = dungeonGroups;
    }

    public static getFromWeekData(seasonId: string, week: WarEchoesWeekData, profileChars: Character[]): WarEchoesGroup {
        const groupId = `s${seasonId}_w${week.id}`;
        const dungeonGroups: WarEchoesDungeonGroup[] = [];

        for (const dgData of week.dungeonGroups || []) {
            dungeonGroups.push(WarEchoesDungeonGroup.getFromData(dgData, profileChars, groupId));
        }

        return new WarEchoesGroup(groupId, dungeonGroups);
    }

    public static getFromSeasonDataList(seasons: WarEchoesSeasonData[], profileChars: Character[]): WarEchoesGroup[] {
        const result: WarEchoesGroup[] = [];

        for (const season of seasons) {
            for (const week of season.weeks || []) {
                result.push(this.getFromWeekData(season.id, week, profileChars));
            }
        }

        return result;
    }

    public static getRecordsFromList(list: WarEchoesGroup[]): WarEchoesRecord[] {
        const result: WarEchoesRecord[] = [];

        for (const item of list) {
            result.push(...item.getAllRecords());
        }

        return result;
    }

    public get groupId(): string {
        return this._groupId;
    }

    public get dungeonGroups(): WarEchoesDungeonGroup[] {
        return this._dungeonGroups;
    }

    public getAllRecords(): WarEchoesRecord[] {
        const result: WarEchoesRecord[] = [];

        for (const dungeonGroup of this._dungeonGroups) {
            result.push(...dungeonGroup.getAll());
        }

        return result;
    }
}
