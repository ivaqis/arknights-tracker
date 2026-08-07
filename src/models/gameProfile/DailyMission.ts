import { DailyMissionEntity } from "@models/gameProfile/entities/DailyMissionEntity.js";
import { IEntityClass } from "@models/IEntityClass.js";

export class DailyMission implements IEntityClass<DailyMissionEntity> {
    private readonly _dailyActivation: number;
    private readonly _maxDailyActivation: number;

    private constructor(entity: DailyMissionEntity) {
        this._dailyActivation = entity.dailyActivation;
        this._maxDailyActivation = entity.maxDailyActivation;
    }

    public static getFromData(entity: DailyMissionEntity): DailyMission {
        return this.getFromEntity(entity);
    }

    public static getFromEntity(entity: DailyMissionEntity): DailyMission {
        return new DailyMission(entity);
    }

    public get dailyActivation(): number {
        return this._dailyActivation;
    }

    public get maxDailyActivation(): number {
        return this._maxDailyActivation;
    }

    public getEntity(): DailyMissionEntity {
        return {
            dailyActivation: this._dailyActivation,
            maxDailyActivation: this._maxDailyActivation,
        };
    }
}