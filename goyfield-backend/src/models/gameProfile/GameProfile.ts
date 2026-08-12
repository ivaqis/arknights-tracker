import { logger } from "@/logger.js";
import { Base } from "@models/gameProfile/Base.js";
import { BpSystem } from "@models/gameProfile/BpSystem.js";
import { Character } from "@models/gameProfile/Character.js";
import { DailyMission } from "@models/gameProfile/DailyMission.js";
import { Dungeon } from "@models/gameProfile/Dungeon.js";
import { CharacterEntity } from "@models/gameProfile/entities/CharacterEntity.js";
import { GameProfileEntity } from "@models/gameProfile/entities/GameProfileEntity.js";
import { SeekSuspicion } from "@models/gameProfile/SeekSuspicion.js";
import { WeeklyMission } from "@models/gameProfile/WeeklyMission.js";
import { IEntityClass } from "@models/IEntityClass.js";
import { CharData } from "@services/skportDetailFetcher/contracts/CharData.js";
import { DetailData } from "@services/skportDetailFetcher/contracts/DetailData.js";

export class GameProfile implements IEntityClass<GameProfileEntity> {
    private readonly _base: Base;
    private readonly _dungeon: Dungeon;
    private readonly _bpSystem: BpSystem;
    private readonly _dailyMission: DailyMission;
    private readonly _weeklyMission: WeeklyMission;
    private readonly _seekSuspicion: SeekSuspicion;
    private readonly _chars: Character[];

    private constructor(base: Base,
                        dungeon: Dungeon,
                        bpSystem: BpSystem,
                        dailyMission: DailyMission,
                        weeklyMission: WeeklyMission,
                        seekSuspicion: SeekSuspicion,
                        chars: Character[]
    ) {
        this._base = base;
        this._dungeon = dungeon;
        this._bpSystem = bpSystem;
        this._dailyMission = dailyMission;
        this._weeklyMission = weeklyMission;
        this._seekSuspicion = seekSuspicion;
        this._chars = chars;
    }

    public static getFromData(data: DetailData, serverId: string) {
        return new GameProfile(
            Base.getFromData(data.base, serverId),
            Dungeon.getFromData(data.dungeon),
            BpSystem.getFromData(data.bpSystem),
            DailyMission.getFromData(data.dailyMission),
            WeeklyMission.getFromData(data.weeklyMission),
            SeekSuspicion.getFromData(data.seekSuspicion),
            this.getChars(data.chars, data.base.gender)
        );
    }

    public static getFromEntity(entity: GameProfileEntity) {
        return new GameProfile(
            Base.getFromEntity(entity.base),
            Dungeon.getFromEntity(entity.dungeon),
            BpSystem.getFromEntity(entity.bpSystem),
            DailyMission.getFromEntity(entity.dailyMission),
            WeeklyMission.getFromEntity(entity.weeklyMission),
            SeekSuspicion.getFromEntity(entity.seekSuspicion),
            this.getCharsFromEntity(entity.chars)
        );
    }

    private static getCharsFromEntity(chars: CharacterEntity[]) {
        return chars.map((char) => Character.getFromEntity(char));
    }

    private static getChars(chars: CharData[], gender: number): Character[] {
        const result: Character[] = [];

        for (const char of chars) {
            let character: Character;

            try {
                character = Character.getFromData(char, gender);
            } catch (e) {
                logger.warn(e);
                continue;
            }

            result.push(character);
        }

        return result;
    }

    public get base(): Base {
        return this._base;
    }

    public get dungeon(): Dungeon {
        return this._dungeon;
    }

    public get bpSystem(): BpSystem {
        return this._bpSystem;
    }

    public get dailyMission(): DailyMission {
        return this._dailyMission;
    }

    public get weeklyMission(): WeeklyMission {
        return this._weeklyMission;
    }

    public get seekSuspicion(): SeekSuspicion {
        return this._seekSuspicion;
    }

    public get chars(): Character[] {
        return this._chars;
    }

    public getEntity(): GameProfileEntity {
        return {
            base: this._base.getEntity(),
            bpSystem: this._bpSystem.getEntity(),
            dailyMission: this._dailyMission.getEntity(),
            dungeon: this._dungeon.getEntity(),
            seekSuspicion: this._seekSuspicion.getEntity(),
            weeklyMission: this._weeklyMission.getEntity(),
            chars: this._chars.map(char => char.getEntity())
        };
    }
}