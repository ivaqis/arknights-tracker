import { GlobalItemStatsEntity } from "@database/entities/GlobalItemStatsEntity";
import { NumberRecordField } from "@database/records/recordFields/NumberRecordField";

export class GlobalItemStatsRecord {
    private readonly _bannerId: string;
    private readonly _itemId: string;

    private readonly _count: NumberRecordField;

    public constructor(entity: GlobalItemStatsEntity) {
        this._bannerId = entity.bannerId;
        this._itemId = entity.itemId;

        this._count = new NumberRecordField(entity.count);
    }

    public get bannerId(): string {
        return this._bannerId;
    }

    public get itemId(): string {
        return this._itemId;
    }

    public get count(): NumberRecordField {
        return this._count;
    }
}