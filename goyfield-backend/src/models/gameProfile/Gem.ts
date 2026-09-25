import { logger } from "@/logger.js";
import { GemEntity } from "@models/gameProfile/entities/GemEntity.js";
import { IEntityClass } from "@models/IEntityClass.js";
import { GemData } from "@services/skportDetailFetcher/contracts/GemData.js";
import { gemPresetNameRecords } from "@staticModels/instances.js";

export class Gem implements IEntityClass<GemEntity> {
    private readonly _id: string;
    private readonly _presetId: string;
    private readonly _iconUrl: string;
    private readonly _templateId?: string;
    private readonly _termId?: string;
    private readonly _name?: string;
    private readonly _terms?: Array<{ id: string, cost: number, name: string }>;

    private constructor(entity: GemEntity) {
        this._id = entity.id;
        this._presetId = entity.presetId;
        this._iconUrl = entity.iconUrl;
        this._templateId = entity.templateId ?? entity.gemData?.templateId;
        this._termId = entity.termId ?? entity.gemData?.termId;
        this._name = entity.name ?? entity.gemData?.name;
        this._terms = entity.terms;
    }

    public static getFromData(data?: GemData): Gem | null {
        if (!data) {
            return null;
        }

        let presetId = gemPresetNameRecords.getId(data.gemData.name);

        if (!presetId) {
            logger.warn(`gemPreset not found:\n${JSON.stringify(data, undefined, 2)}`);

            presetId = data.gemData.termId || data.id;
        }

        return this.getFromEntity({
            id: data.id,
            presetId: presetId,
            iconUrl: data.gemData.icon,
            templateId: data.gemData.templateId,
            termId: data.gemData.termId,
            name: data.gemData.name,
            terms: data.terms,
            gemData: data.gemData
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

    public get templateId(): string | undefined {
        return this._templateId;
    }

    public get termId(): string | undefined {
        return this._termId;
    }

    public get name(): string | undefined {
        return this._name;
    }

    public get terms(): Array<{ id: string, cost: number, name: string }> | undefined {
        return this._terms;
    }

    public getEntity(): GemEntity {
        return {
            id: this.id,
            presetId: this.presetId,
            iconUrl: this.iconUrl,
            templateId: this._templateId,
            termId: this._termId,
            name: this._name,
            terms: this._terms,
            gemData: {
                termId: this._termId ?? "",
                name: this._name ?? "",
                templateId: this._templateId ?? "",
                icon: this.iconUrl
            }
        };
    }
}

