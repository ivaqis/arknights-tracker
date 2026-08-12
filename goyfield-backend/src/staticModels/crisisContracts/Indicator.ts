import { IndicatorEntity } from "@staticModels/crisisContracts/IndicatorEntity.js";

export class Indicator {
    private readonly _id: string;
    private readonly _tagId: string;
    private readonly _nameId: string;

    public constructor(entity: IndicatorEntity) {
        this._id = entity.id;
        this._tagId = entity.tagId;
        this._nameId = entity.nameId;
    }

    public get id(): string {
        return this._id;
    }

    public get tagId(): string {
        return this._tagId;
    }

    public get nameId(): string {
        return this._nameId;
    }
}