import { RecordsModel } from "@staticModels/RecordsModel.js";
import { WarEchoesGroupEntity } from "@staticModels/warEchoes/WarEchoesGroupEntity.js";

export class WarEchoesGroupRecords extends RecordsModel<WarEchoesGroupEntity> {
    private readonly _hardDungeon2GroupMap: Map<string, string>;
    private readonly _normalDungeon2GroupMap: Map<string, string>;
    private readonly _brutalDungeon2GroupMap: Map<string, string>;

    public constructor(list: WarEchoesGroupEntity[]) {
        super(list, entity => entity.id, "WarEchoesGroupRecords");

        this._hardDungeon2GroupMap = WarEchoesGroupRecords.getMap(list, item => item.hardDungeons);
        this._normalDungeon2GroupMap = WarEchoesGroupRecords.getMap(list, item => item.normalDungeons);
        this._brutalDungeon2GroupMap = WarEchoesGroupRecords.getMap(list, item => item.brutalDungeons);
    }

    private static getMap(list: WarEchoesGroupEntity[], getDungeonList: (entity: WarEchoesGroupEntity) => string[]): Map<string, string> {
        const map = new Map<string, string>();

        for (const item of list) {
            for (const dungeonId of getDungeonList(item)) {
                map.set(dungeonId, item.id);
            }
        }

        return map;
    }

    public getGroupId(dungeonId: string): string | null {
        return this._normalDungeon2GroupMap.get(dungeonId)
            ?? this._hardDungeon2GroupMap.get(dungeonId)
            ?? this._brutalDungeon2GroupMap.get(dungeonId)
            ?? null;
    }

    public getDifficulty(dungeonId: string): "normal" | "hard" | "brutal" {
        if (this._normalDungeon2GroupMap.has(dungeonId)) return "normal";
        if (this._hardDungeon2GroupMap.has(dungeonId)) return "hard";
        if (this._brutalDungeon2GroupMap.has(dungeonId)) return "brutal";
        return "normal";
    }

    public getNormalDungeons(groupId: string): string[] | null {
        return this.get(groupId)?.normalDungeons ?? null;
    }

    public getHardDungeons(groupId: string): string[] | null {
        return this.get(groupId)?.hardDungeons ?? null;
    }

    public getBrutalDungeons(groupId: string): string[] | null {
        return this.get(groupId)?.brutalDungeons ?? null;
    }

    public getDungeonsByDifficulty(groupId: string, difficulty: string): string[] | null {
        if (difficulty === "hard") return this.getHardDungeons(groupId);
        if (difficulty === "brutal") return this.getBrutalDungeons(groupId);
        return this.getNormalDungeons(groupId);
    }
}
