import { DailyMissionEntity } from "@models/gameProfile/entities/DailyMissionEntity";
import { IEntityClass } from "@models/IEntityClass";

export class DailyMission implements IEntityClass<DailyMissionEntity> {
    private readonly _dailyActivation: number;
    private readonly _maxDailyActivation: number;

    constructor(entity: DailyMissionEntity) {
        this._dailyActivation = entity.dailyActivation;
        this._maxDailyActivation = entity.maxDailyActivation;
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