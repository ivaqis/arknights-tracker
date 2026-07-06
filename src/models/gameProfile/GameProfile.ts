import { Base } from "@models/gameProfile/Base";
import { BpSystem } from "@models/gameProfile/BpSystem";
import { Character } from "@models/gameProfile/Character";
import { DailyMission } from "@models/gameProfile/DailyMission";
import { Dungeon } from "@models/gameProfile/Dungeon";
import { GameProfileEntity } from "@models/gameProfile/entities/GameProfileEntity";
import { SeekSuspicion } from "@models/gameProfile/SeekSuspicion";
import { WeeklyMission } from "@models/gameProfile/WeeklyMission";
import { IEntityClass } from "@models/IEntityClass";
import { CharData } from "@services/skportDetailFetcher/contracts/CharData";
import { DetailData } from "@services/skportDetailFetcher/contracts/DetailData";

export class GameProfile implements IEntityClass<GameProfileEntity> {
    private readonly _base: Base;
    private readonly _dungeon: Dungeon;
    private readonly _bpSystem: BpSystem;
    private readonly _dailyMission: DailyMission;
    private readonly _weeklyMission: WeeklyMission;
    private readonly _seekSuspicion: SeekSuspicion;
    private readonly _chars: Character[];

    public constructor(data: DetailData, serverId: string) {
        this._base = new Base(data.base, serverId);
        this._dungeon = new Dungeon(data.dungeon);
        this._bpSystem = new BpSystem(data.bpSystem);
        this._dailyMission = new DailyMission(data.dailyMission);
        this._weeklyMission = new WeeklyMission(data.weeklyMission);
        this._seekSuspicion = new SeekSuspicion(data.seekSuspicion);
        this._chars = GameProfile.getChars(data.chars);
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

    private static getChars(chars: CharData[]): Character[] {
        const result: Character[] = [];

        for (const char of chars) {
            let character = new Character(char);

            result.push(character);
        }

        return result;
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