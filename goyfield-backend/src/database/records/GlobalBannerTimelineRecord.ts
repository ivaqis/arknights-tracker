import { GlobalBannerTimelineEntity } from "@database/entities/GlobalBannerTimelineEntity.js";
import { NumberRecordField } from "@database/records/recordFields/NumberRecordField.js";

export class GlobalBannerTimelineRecord {
    private readonly _bannerId: string;
    private readonly _date: string;

    private readonly _totalPullsCount: NumberRecordField;
    private readonly _freePullsCount: NumberRecordField;

    public constructor(entity: GlobalBannerTimelineEntity) {
        this._bannerId = entity.bannerId;
        this._date = entity.date;

        this._totalPullsCount = new NumberRecordField(entity.totalPullsCount);
        this._freePullsCount = new NumberRecordField(entity.freePullsCount);
    }

    public get bannerId(): string {
        return this._bannerId;
    }

    public get date(): string {
        return this._date;
    }

    public get totalPullsCount(): NumberRecordField {
        return this._totalPullsCount;
    }

    public get freePullsCount(): NumberRecordField {
        return this._freePullsCount;
    }
}