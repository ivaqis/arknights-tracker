import { logger } from "@/logger";
import { EquipEntity } from "@models/gameProfile/entities/EquipEntity";
import { IEntityClass } from "@models/IEntityClass";
import { EquipData } from "@services/skportDetailFetcher/contracts/EquipData";
import { equipNameRecords } from "@staticModels/instances";

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
            logger.warn(`equipId not found:\n${data}`);
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