import { logger } from "@/logger";
import { EquipEntity } from "@models/gameProfile/entities/EquipEntity";
import { IEntityClass } from "@models/IEntityClass";
import { EquipData } from "@services/skportDetailFetcher/contracts/EquipData";
import { equipNameRecords } from "@staticModels/instances";

export class Equip implements IEntityClass<EquipEntity> {
    private readonly _id: string;

    public constructor(entity: EquipData) {
        const id = equipNameRecords.getId(entity.equipData.name);

        if (!id) {
            throw new Error(`equipId not found:\n${entity}`);
        }

        this._id = id;
    }

    public get id(): string {
        return this._id;
    }

    public static get(entity?: EquipData): Equip | null {
        if (!entity) {
            return null;
        }

        let equip: Equip;
        try {
            equip = new Equip(entity);
        } catch (e) {
            logger.warn(e);

            return null;
        }

        return equip;
    }

    public getEntity(): EquipEntity {
        return {
            id: this._id,
        };
    }
}