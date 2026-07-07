import { Character } from "@models/gameProfile/Character";
import { MonumentRecord } from "@models/monument/MonumentRecord";
import { MonumentDungeonGroupData } from "@services/monumentFetcher/contracts/MonumentDungeonGroupData";

export class MonumentDungeonGroup {
    private readonly _normalDungeon: MonumentRecord | null;
    private readonly _hardDungeon: MonumentRecord | null;

    private constructor(normalDungeon: MonumentRecord | null, hardDungeon: MonumentRecord | null) {
        this._normalDungeon = normalDungeon;
        this._hardDungeon = hardDungeon;
    }

    public static getFromData(data: MonumentDungeonGroupData, profileChars: Character[]): MonumentDungeonGroup {
        let normal = MonumentRecord.getFromData(data.normalDungeon, profileChars);
        let hard = MonumentRecord.getFromData(data.hardDungeon, profileChars);

        return new MonumentDungeonGroup(
            normal,
            hard
        );
    }

    public get normalDungeon(): MonumentRecord | null {
        return this._normalDungeon;
    }

    public get hardDungeon(): MonumentRecord | null {
        return this._hardDungeon;
    }

    public getAll(): MonumentRecord[] {
        const result: MonumentRecord[] = [];

        if (this._hardDungeon) {
            result.push(this._hardDungeon);
        }
        if (this._normalDungeon) {
            result.push(this._normalDungeon);
        }

        return result;
    }
}