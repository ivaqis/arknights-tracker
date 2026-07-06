import { logger } from "@/logger";
import { GemEntity } from "@models/gameProfile/entities/GemEntity";
import { IEntityClass } from "@models/IEntityClass";
import { GemData } from "@services/skportDetailFetcher/contracts/GemData";
import { gemPresetNameRecords } from "@staticModels/instances";

export class Gem implements IEntityClass<GemEntity> {
    private readonly _id: string;
    private readonly _presetId: string;
    private readonly _iconUrl: string;

    public constructor(entity: GemData) {
        let presetId = gemPresetNameRecords.getId(entity.gemData.name);

        if (!presetId) {
            logger.warn(`gemPreset not found:\n${entity}`);

            this._presetId = "";
        } else {
            this._presetId = presetId;
        }

        this._id = entity.id;
        this._iconUrl = entity.gemData.icon;
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

    public static get(entity?: GemData): Gem | null {
        if (!entity) {
            return null;
        }

        return new Gem(entity);
    }

    public getEntity(): GemEntity {
        return {
            id: this.id,
            presetId: this.presetId,
            iconUrl: this.iconUrl,
        };
    }
}

