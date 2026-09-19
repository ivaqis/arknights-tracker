import { logger } from "@/logger.js";
import { EquipEntity } from "@models/gameProfile/entities/EquipEntity.js";
import { IEntityClass } from "@models/IEntityClass.js";
import { EquipData } from "@services/skportDetailFetcher/contracts/EquipData.js";
import { equipNameRecords } from "@staticModels/instances.js";

export class Equip implements IEntityClass<EquipEntity> {
    private readonly _id: string;
    private readonly _level: number;
    private readonly _enhanceStatus: number;
    private readonly _enhance?: Record<string, number>;
    private readonly _name?: string;

    private constructor(entity: EquipEntity) {
        this._id = entity.id;
        this._level = entity.level ?? 0;
        this._enhanceStatus = entity.enhanceStatus ?? 1;
        this._enhance = entity.enhance;
        this._name = entity.name;
    }

    public static getFromData(data?: EquipData): Equip | null {
        if (!data) {
            return null;
        }

        let id = equipNameRecords.getId(data.equipData.name);

        if (!id) {
            logger.warn(`equipId not found: ${data.equipData.name}`);
            id = data.equipData.id || data.equipId;
        }

        const level = parseInt(data.equipData.level?.value || "0", 10);
        const enhanceCount = Object.keys(data.enhance || {}).length;
        const enhanceStatus = enhanceCount + 1;

        return this.getFromEntity({
            id: id,
            level: level,
            enhanceStatus: enhanceStatus,
            enhance: data.enhance,
            name: data.equipData.name
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

    public get level(): number {
        return this._level;
    }

    public get enhanceStatus(): number {
        return this._enhanceStatus;
    }

    public get enhance(): Record<string, number> | undefined {
        return this._enhance;
    }

    public get name(): string | undefined {
        return this._name;
    }

    public getEntity(): EquipEntity {
        return {
            id: this._id,
            level: this._level,
            enhanceStatus: this._enhanceStatus,
            enhance: this._enhance,
            name: this._name
        };
    }
}