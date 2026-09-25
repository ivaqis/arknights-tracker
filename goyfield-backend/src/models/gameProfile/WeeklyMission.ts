import { WeeklyMissionEntity } from "@models/gameProfile/entities/WeeklyMissionEntity.js";
import { IEntityClass } from "@models/IEntityClass.js";

export class WeeklyMission implements IEntityClass<WeeklyMissionEntity> {
    private readonly _score: number;
    private readonly _total: number;

    private constructor(entity: WeeklyMissionEntity) {
        this._score = entity.score;
        this._total = entity.total;
    }

    public static getFromData(entity: WeeklyMissionEntity): WeeklyMission {
        return this.getFromEntity(entity);
    }

    public static getFromEntity(entity: WeeklyMissionEntity): WeeklyMission {
        return new WeeklyMission(entity);
    }

    public get score(): number {
        return this._score;
    }

    public get total(): number {
        return this._total;
    }

    public getEntity(): WeeklyMissionEntity {
        return {
            score: this._score,
            total: this._total,
        };
    }
}