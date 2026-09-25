import { logger } from "@/logger.js";
import { Character } from "@models/gameProfile/Character.js";
import { IEntityClass } from "@models/IEntityClass.js";
import { MonumentRecordEntity } from "@models/monument/entities/MonumentRecordEntity.js";
import { MonumentCharacter } from "@models/monument/MonumentCharacter.js";
import { MonumentCharData } from "@services/monumentFetcher/contracts/MonumentCharData.js";
import { MonumentDungeonData } from "@services/monumentFetcher/contracts/MonumentDungeonData.js";
import { monumentGroupRecords, monumentNameRecords } from "@staticModels/instances.js";

export class MonumentRecord implements IEntityClass<MonumentRecordEntity> {
    private readonly _dungeonId: string;
    private readonly _groupId: string;
    private readonly _ts: string;
    private readonly _passTS: number;
    private readonly _chars: MonumentCharacter[];

    private constructor(groupId: string, dungeonId: string, ts: string, passTS: number, chars: MonumentCharacter[]) {
        this._groupId = groupId;
        this._dungeonId = dungeonId;
        this._ts = ts;
        this._passTS = passTS;
        this._chars = chars;
    }

    public static getFromData(data: MonumentDungeonData, profileChars: Character[]): MonumentRecord | null {
        if (!data.isPass || !data.bestRecord) {
            return null;
        }

        let dungeonId = monumentNameRecords.getId(data.name);

        if (!dungeonId) {
            logger.warn(`MonumentId not found: ${data.name}`);

            return null;
        }

        let groupId = monumentGroupRecords.getGroupId(dungeonId);

        if (!groupId) {
            logger.warn(`Monument groupId not found: ${dungeonId}`);

            return null;
        }

        return new MonumentRecord(
            groupId,
            dungeonId,
            data.bestRecord.ts,
            Number(data.bestRecord.passTs),
            this.getCharList(data.bestRecord.chars, profileChars)
        );
    }

    public static getFromEntity(entity: MonumentRecordEntity | null): MonumentRecord | null {
        if (!entity) {
            return null;
        }

        return new MonumentRecord(
            entity.groupId,
            entity.dungeonId,
            entity.ts,
            entity.passTs,
            entity.chars.map(char => MonumentCharacter.getFromEntity(char))
        );
    }

    public static getFromEntityList(list: MonumentRecordEntity[]): MonumentRecord[] {
        const result: MonumentRecord[] = [];

        for (const item of list) {
            let record = this.getFromEntity(item);

            if (!record) {
                continue;
            }

            result.push(record);
        }

        return result;
    }

    private static getCharMap(profileChars: Character[]): Map<string, Character> {
        let map = new Map<string, Character>();

        for (const char of profileChars) {
            map.set(char.apiId, char);
        }

        return map;
    }

    private static getCharList(chars: MonumentCharData[], profileChars: Character[]): MonumentCharacter[] {
        const map = this.getCharMap(profileChars);
        const result: MonumentCharacter[] = [];

        for (const char of chars) {
            let profileChar = map.get(char.charId);

            if (!profileChar) {
                logger.warn(`Could not find char "${char.charId}"`);

                continue;
            }

            result.push(MonumentCharacter.getFromData(char, profileChar));
        }

        return result;
    }

    public get groupId(): string {
        return this._groupId;
    }

    public get dungeonId(): string {
        return this._dungeonId;
    }

    public get ts(): string {
        return this._ts;
    }

    public get passTS(): number {
        return this._passTS;
    }

    public get chars(): MonumentCharacter[] {
        return this._chars;
    }

    public get isHard(): boolean {
        return monumentGroupRecords.isHard(this.dungeonId);
    }

    public getEntity(): MonumentRecordEntity {
        return {
            groupId: this.groupId,
            dungeonId: this.dungeonId,
            isHard: this.isHard,
            ts: this.ts,
            passTs: this.passTS,
            chars: this.chars.map(char => char.getEntity())
        };
    }
}