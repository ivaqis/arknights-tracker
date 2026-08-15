import { logger } from "@/logger.js";
import { GemEntity } from "@models/gameProfile/entities/GemEntity.js";
import { IEntityClass } from "@models/IEntityClass.js";
import { GemData } from "@services/skportDetailFetcher/contracts/GemData.js";
import { gemPresetNameRecords } from "@staticModels/instances.js";

export class Gem implements IEntityClass<GemEntity> {
    private readonly _id: string;
    private readonly _presetId: string;
    private readonly _iconUrl: string;

    private constructor(entity: GemEntity) {
        this._id = entity.id;
        this._presetId = entity.presetId;
        this._iconUrl = entity.iconUrl;
    }

    public static getFromData(data?: GemData): Gem | null {
        if (!data) {
            return null;
        }

        let presetId = gemPresetNameRecords.getId(data.gemData.name);

        if (!presetId) {
            logger.warn(`gemPreset not found:\n${JSON.stringify(data, undefined, 2)}`);

            return null;
        }

        return this.getFromEntity({
            id: data.id,
            presetId: presetId,
            iconUrl: data.gemData.icon
        });
    }

    public static getFromEntity(entity: GemEntity | null): Gem | null {
        if (!entity) {
            return null;
        }

        return new Gem(entity);
    }

    public get id(): string {
        return this._id;
    }

    public get presetId(): string {
        return this._presetId;
    }

    public get iconUrl(): string {
        return this._iconUrl;
    }

    public getEntity(): GemEntity {
        return {
            id: this.id,
            presetId: this.presetId,
            iconUrl: this.iconUrl,
        };
    }
}

