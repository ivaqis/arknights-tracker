import { logger } from "@/logger.js";
import { Character } from "@models/gameProfile/Character.js";
import { IEntityClass } from "@models/IEntityClass.js";
import { WarEchoesRecordEntity } from "@models/warEchoes/entities/WarEchoesRecordEntity.js";
import { WarEchoesCharacter } from "@models/warEchoes/WarEchoesCharacter.js";
import { WarEchoesCharData } from "@services/warEchoesFetcher/contracts/WarEchoesCharData.js";
import { WarEchoesDungeonData } from "@services/warEchoesFetcher/contracts/WarEchoesDungeonData.js";
import { warEchoesGroupRecords, warEchoesNameRecords } from "@staticModels/instances.js";

export class WarEchoesRecord implements IEntityClass<WarEchoesRecordEntity> {
    private readonly _dungeonId: string;
    private readonly _groupId: string;
    private readonly _difficulty: string;
    private readonly _ts: string;
    private readonly _passTS: number;
    private readonly _chars: WarEchoesCharacter[];

    private constructor(groupId: string, dungeonId: string, difficulty: string, ts: string, passTS: number, chars: WarEchoesCharacter[]) {
        this._groupId = groupId;
        this._dungeonId = dungeonId;
        this._difficulty = difficulty;
        this._ts = ts;
        this._passTS = passTS;
        this._chars = chars;
    }

    public static getFromData(data: WarEchoesDungeonData, profileChars: Character[], difficulty: "normal" | "hard" | "brutal", fallbackGroupId?: string): WarEchoesRecord | null {
        if (!data.isPass || !data.bestRecord) {
            return null;
        }

        let nameKey = data.name;
        if (difficulty === "hard") nameKey = `${data.name}: Hard`;
        if (difficulty === "brutal") nameKey = `${data.name}: Brutal`;

        let dungeonId = warEchoesNameRecords.getId(nameKey) || warEchoesNameRecords.getId(data.name);

        if (!dungeonId) {
            logger.warn(`WarEchoes dungeonId not found: ${data.name} (${difficulty})`);
            return null;
        }

        let groupId = fallbackGroupId || warEchoesGroupRecords.getGroupId(dungeonId);

        if (!groupId) {
            logger.warn(`WarEchoes groupId not found: ${dungeonId}`);
            return null;
        }

        return new WarEchoesRecord(
            groupId,
            dungeonId,
            difficulty,
            data.bestRecord.ts,
            Number(data.bestRecord.passTs),
            this.getCharList(data.bestRecord.chars, profileChars)
        );
    }

    public static getFromEntity(entity: WarEchoesRecordEntity | null): WarEchoesRecord | null {
        if (!entity) {
            return null;
        }

        return new WarEchoesRecord(
            entity.groupId,
            entity.dungeonId,
            entity.difficulty,
            entity.ts,
            entity.passTs,
            entity.chars.map(char => WarEchoesCharacter.getFromEntity(char))
        );
    }

    public static getFromEntityList(list: WarEchoesRecordEntity[]): WarEchoesRecord[] {
        const result: WarEchoesRecord[] = [];

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

    private static getCharList(chars: WarEchoesCharData[], profileChars: Character[]): WarEchoesCharacter[] {
        const map = this.getCharMap(profileChars);
        const result: WarEchoesCharacter[] = [];

        for (const char of chars) {
            let profileChar = map.get(char.charId);

            if (!profileChar) {
                logger.warn(`Could not find char "${char.charId}"`);
                continue;
            }

            result.push(WarEchoesCharacter.getFromData(char, profileChar));
        }

        return result;
    }

    public get groupId(): string {
        return this._groupId;
    }

    public get dungeonId(): string {
        return this._dungeonId;
    }

    public get difficulty(): string {
        return this._difficulty;
    }

    public get ts(): string {
        return this._ts;
    }

    public get passTS(): number {
        return this._passTS;
    }

    public get chars(): WarEchoesCharacter[] {
        return this._chars;
    }

    public getEntity(): WarEchoesRecordEntity {
        return {
            groupId: this.groupId,
            dungeonId: this.dungeonId,
            difficulty: this.difficulty,
            ts: this.ts,
            passTs: this.passTS,
            chars: this.chars.map(char => char.getEntity())
        };
    }
}
