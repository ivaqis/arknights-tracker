import { BaseEntity } from "@models/gameProfile/entities/BaseEntity.js";
import { BpSystemEntity } from "@models/gameProfile/entities/BpSystemEntity.js";
import { CharacterEntity } from "@models/gameProfile/entities/CharacterEntity.js";
import { DailyMissionEntity } from "@models/gameProfile/entities/DailyMissionEntity.js";
import { DungeonEntity } from "@models/gameProfile/entities/DungeonEntity.js";
import { SeekSuspicionEntity } from "@models/gameProfile/entities/SeekSuspicionEntity.js";
import { WeeklyMissionEntity } from "@models/gameProfile/entities/WeeklyMissionEntity.js";

export interface GameProfileEntity {
    base: BaseEntity;
    dungeon: DungeonEntity;
    bpSystem: BpSystemEntity;
    dailyMission: DailyMissionEntity;
    weeklyMission: WeeklyMissionEntity;
    seekSuspicion: SeekSuspicionEntity;
    chars: CharacterEntity[];
}