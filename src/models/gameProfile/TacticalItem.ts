import { logger } from "@/logger";
import { TacticalItemEntity } from "@models/gameProfile/entities/TacticalItemEntity";
import { IEntityClass } from "@models/IEntityClass";
import { TacticalItemData } from "@services/skportDetailFetcher/contracts/TacticalItemData";
import { tacticalItemNameRecords } from "@staticModels/instances";

export class TacticalItem implements IEntityClass<TacticalItemEntity> {
    private readonly _id: string;

    public constructor(entity: TacticalItemData) {
        const id = tacticalItemNameRecords.getId(entity.tacticalItemData.name);

        if (!id) {
            throw new Error(`tacticalItemId not found:\n${entity}`);
        }

        this._id = id;
    }

    public get id(): string {
        return this._id;
    }

    public static get(entity?: TacticalItemData): TacticalItem | null {
        if (!entity) {
            return null;
        }

        let item: TacticalItem;
        try {
            item = new TacticalItem(entity);
        } catch (e) {
            logger.warn(e);

            return null;
        }

        return item;
    }

    public getEntity(): TacticalItemEntity {
        return {
            id: this._id,
        };
    }
}