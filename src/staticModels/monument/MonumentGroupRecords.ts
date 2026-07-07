import { MonumentGroupEntity } from "@staticModels/monument/MonumentGroupEntity";
import { RecordsModel } from "@staticModels/RecordsModel";

export class MonumentGroupRecords extends RecordsModel<MonumentGroupEntity> {
    private readonly _hardDungeon2GroupMap: Map<string, string>;
    private readonly _normalDungeon2GroupMap: Map<string, string>;

    public constructor(list: MonumentGroupEntity[]) {
        super(list, entity => entity.id, "MonumentGroupRecords");

        this._hardDungeon2GroupMap = MonumentGroupRecords.getMap(list, item => item.hardDungeons);
        this._normalDungeon2GroupMap = MonumentGroupRecords.getMap(list, item => item.normalDungeons);
    }

    private static getMap(list: MonumentGroupEntity[], getDungeonList: (entity: MonumentGroupEntity) => string[]): Map<string, string> {
        const map = new Map<string, string>();

        for (const item of list) {
            let groupId = item.id;

            for (const dungeonId of getDungeonList(item)) {
                map.set(dungeonId, groupId);
            }
        }

        return map;
    }

    public getHardDungeons(id: string): string[] | null {
        return this.get(id)?.hardDungeons ?? null;
    }

    public getNormalDungeons(id: string): string[] | null {
        return this.get(id)?.normalDungeons ?? null;
    }

    public getGroupId(dungeonId: string): string | null {
        return this._hardDungeon2GroupMap.get(dungeonId)
            ?? this._normalDungeon2GroupMap.get(dungeonId)
            ?? null;
    }

    public isHard(dungeonId: string): boolean {
        return this._hardDungeon2GroupMap.has(dungeonId);
    }
}