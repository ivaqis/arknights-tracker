import { WeeklyMissionEntity } from "@models/gameProfile/entities/WeeklyMissionEntity";
import { IEntityClass } from "@models/IEntityClass";

export class WeeklyMission implements IEntityClass<WeeklyMissionEntity> {
    private readonly _score: number;
    private readonly _total: number;

    public constructor(entity: WeeklyMissionEntity) {
        this._score = entity.score;
        this._total = entity.total;
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