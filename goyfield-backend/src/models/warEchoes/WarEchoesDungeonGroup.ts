import { Character } from "@models/gameProfile/Character.js";
import { WarEchoesRecord } from "@models/warEchoes/WarEchoesRecord.js";
import { WarEchoesDungeonGroupData } from "@services/warEchoesFetcher/contracts/WarEchoesDungeonGroupData.js";

export class WarEchoesDungeonGroup {
    private readonly _normalDungeon: WarEchoesRecord | null;
    private readonly _hardDungeon: WarEchoesRecord | null;
    private readonly _cruelDungeon: WarEchoesRecord | null;

    private constructor(normalDungeon: WarEchoesRecord | null, hardDungeon: WarEchoesRecord | null, cruelDungeon: WarEchoesRecord | null) {
        this._normalDungeon = normalDungeon;
        this._hardDungeon = hardDungeon;
        this._cruelDungeon = cruelDungeon;
    }

    public static getFromData(data: WarEchoesDungeonGroupData, profileChars: Character[], groupId?: string): WarEchoesDungeonGroup {
        let normal = WarEchoesRecord.getFromData(data.normalDungeon, profileChars, "normal", groupId);
        let hard = WarEchoesRecord.getFromData(data.hardDungeon, profileChars, "hard", groupId);
        let cruel = WarEchoesRecord.getFromData(data.cruelDungeon, profileChars, "brutal", groupId);

        return new WarEchoesDungeonGroup(
            normal,
            hard,
            cruel
        );
    }

    public get normalDungeon(): WarEchoesRecord | null {
        return this._normalDungeon;
    }

    public get hardDungeon(): WarEchoesRecord | null {
        return this._hardDungeon;
    }

    public get cruelDungeon(): WarEchoesRecord | null {
        return this._cruelDungeon;
    }

    public getAll(): WarEchoesRecord[] {
        const result: WarEchoesRecord[] = [];

        if (this._cruelDungeon) {
            result.push(this._cruelDungeon);
        }
        if (this._hardDungeon) {
            result.push(this._hardDungeon);
        }
        if (this._normalDungeon) {
            result.push(this._normalDungeon);
        }

        return result;
    }
}
