import { logger } from "@/logger.js";
import { EquipEntity } from "@models/gameProfile/entities/EquipEntity.js";
import { IEntityClass } from "@models/IEntityClass.js";
import { EquipData } from "@services/skportDetailFetcher/contracts/EquipData.js";
import { equipNameRecords } from "@staticModels/instances.js";

export class Equip implements IEntityClass<EquipEntity> {
    private readonly _id: string;

    private constructor(entity: EquipEntity) {
        this._id = entity.id;
    }

    public static getFromData(data?: EquipData): Equip | null {
        if (!data) {
            return null;
        }

        const id = equipNameRecords.getId(data.equipData.name);

        if (!id) {
            logger.warn(`equipId not found:\n${JSON.stringify(data, undefined, 2)}`);
            return null;
        }

        return this.getFromEntity({
            id: id
        });
    }

    public static getFromEntity(entity: EquipEntity | null): Equip | null {
        if (!entity) {
            return null;
        }

        return new Equip(entity);
    }

    public get id(): string {
        return this._id;
    }

    public getEntity(): EquipEntity {
        return {
            id: this._id,
        };
    }
}