import { BaseEntity } from "@models/gameProfile/entities/BaseEntity";
import { BpSystemEntity } from "@models/gameProfile/entities/BpSystemEntity";
import { CharacterEntity } from "@models/gameProfile/entities/CharacterEntity";
import { DailyMissionEntity } from "@models/gameProfile/entities/DailyMissionEntity";
import { DungeonEntity } from "@models/gameProfile/entities/DungeonEntity";
import { SeekSuspicionEntity } from "@models/gameProfile/entities/SeekSuspicionEntity";
import { WeeklyMissionEntity } from "@models/gameProfile/entities/WeeklyMissionEntity";

export interface GameProfileEntity {
    base: BaseEntity;
    dungeon: DungeonEntity;
    bpSystem: BpSystemEntity;
    dailyMission: DailyMissionEntity;
    weeklyMission: WeeklyMissionEntity;
    seekSuspicion: SeekSuspicionEntity;
    chars: CharacterEntity[];
}