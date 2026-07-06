import { SeekSuspicionEntity } from "@models/gameProfile/entities/SeekSuspicionEntity";
import { IEntityClass } from "@models/IEntityClass";

export class SeekSuspicion implements IEntityClass<SeekSuspicionEntity> {
    private readonly _count: number;
    private readonly _total: number;

    public constructor(entity: SeekSuspicionEntity) {
        this._count = entity.count;
        this._total = entity.total;
    }

    public get count(): number {
        return this._count;
    }

    public get total(): number {
        return this._total;
    }

    public getEntity(): SeekSuspicionEntity {
        return {
            count: this._count,
            total: this._total,
        };
    }
}