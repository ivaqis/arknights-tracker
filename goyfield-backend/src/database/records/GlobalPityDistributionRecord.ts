import { GlobalPityDistributionEntity } from "@database/entities/GlobalPityDistributionEntity.js";
import { NumberRecordField } from "@database/records/recordFields/NumberRecordField.js";

export class GlobalPityDistributionRecord {
    private readonly _bannerId: string;
    private readonly _pity: number;
    private readonly _rarity: number;

    private readonly _count: NumberRecordField;

    public constructor(entity: GlobalPityDistributionEntity) {
        this._bannerId = entity.bannerId;
        this._pity = entity.pity;
        this._rarity = entity.rarity;

        this._count = new NumberRecordField(entity.count);
    }

    public get bannerId(): string {
        return this._bannerId;
    }

    public get pity(): number {
        return this._pity;
    }

    public get rarity(): number {
        return this._rarity;
    }

    public get count(): NumberRecordField {
        return this._count;
    }
}