import { GlobalItemStatsEntity } from "@database/entities/GlobalItemStatsEntity.js";
import { NumberRecordField } from "@database/records/recordFields/NumberRecordField.js";

export class GlobalItemStatsRecord {
    private readonly _bannerId: string;
    private readonly _itemId: string;
    private readonly _rarity: number;

    private readonly _count: NumberRecordField;

    public constructor(entity: GlobalItemStatsEntity) {
        this._bannerId = entity.bannerId;
        this._itemId = entity.itemId;
        this._rarity = entity.rarity;

        this._count = new NumberRecordField(entity.count);
    }

    public get bannerId(): string {
        return this._bannerId;
    }

    public get itemId(): string {
        return this._itemId;
    }

    public get rarity(): number {
        return this._rarity;
    }

    public get count(): NumberRecordField {
        return this._count;
    }
}