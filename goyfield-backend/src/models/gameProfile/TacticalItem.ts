import { logger } from "@/logger.js";
import { TacticalItemEntity } from "@models/gameProfile/entities/TacticalItemEntity.js";
import { IEntityClass } from "@models/IEntityClass.js";
import { TacticalItemData } from "@services/skportDetailFetcher/contracts/TacticalItemData.js";
import { tacticalItemNameRecords } from "@staticModels/instances.js";

export class TacticalItem implements IEntityClass<TacticalItemEntity> {
    private readonly _id: string;

    private constructor(entity: TacticalItemEntity) {
        this._id = entity.id;
    }

    public static getFromData(data?: TacticalItemData): TacticalItem | null {
        if (!data) {
            return null;
        }

        const id = tacticalItemNameRecords.getId(data.tacticalItemData.name);

        if (!id) {
            logger.warn(`tacticalItemId not found:\n${JSON.stringify(data, undefined, 2)}`);

            return null;
        }

        return this.getFromEntity({
            id: id
        });
    }

    public static getFromEntity(entity: TacticalItemEntity | null): TacticalItem | null {
        if (!entity) {
            return null;
        }

        return new TacticalItem(entity);
    }

    public get id(): string {
        return this._id;
    }

    public getEntity(): TacticalItemEntity {
        return {
            id: this._id,
        };
    }
}