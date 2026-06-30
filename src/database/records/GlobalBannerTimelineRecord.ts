import { GlobalBannerTimelineEntity } from "@database/entities/GlobalBannerTimelineEntity";
import { NumberRecordField } from "@database/records/recordFields/NumberRecordField";

export class GlobalBannerTimelineRecord {
    private readonly _bannerId: string;
    private readonly _date: string;

    private readonly _pullsCount: NumberRecordField;

    public constructor(entity: GlobalBannerTimelineEntity) {
        this._bannerId = entity.bannerId;
        this._date = entity.date;

        this._pullsCount = new NumberRecordField(entity.pullsCount);
    }

    public get bannerId(): string {
        return this._bannerId;
    }

    public get date(): string {
        return this._date;
    }

    public get pullsCount(): NumberRecordField {
        return this._pullsCount;
    }
}