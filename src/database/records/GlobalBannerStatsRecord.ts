import { GlobalBannerStatsEntity } from "@database/entities/GlobalBannerStatsEntity";
import { NumberRecordField } from "@database/records/recordFields/NumberRecordField";

export class GlobalBannerStatsRecord {
    private readonly _bannerId: string;

    private readonly _totalUsers: NumberRecordField;
    private readonly _unfreePulls: NumberRecordField;
    private readonly _total6: NumberRecordField;
    private readonly _total5: NumberRecordField;
    private readonly _won5050: NumberRecordField;
    private readonly _total5050: NumberRecordField;
    private readonly _freePulls: NumberRecordField;
    private readonly _free6: NumberRecordField;
    private readonly _free5: NumberRecordField;
    private readonly _freeWin5050: NumberRecordField;

    public constructor(entity: GlobalBannerStatsEntity) {
        this._bannerId = entity.bannerId;

        this._totalUsers = new NumberRecordField(entity.totalUsers);
        this._unfreePulls = new NumberRecordField(entity.unfreePulls);
        this._total6 = new NumberRecordField(entity.total6);
        this._total5 = new NumberRecordField(entity.total5);
        this._won5050 = new NumberRecordField(entity.won5050);
        this._total5050 = new NumberRecordField(entity.total5050);
        this._freePulls = new NumberRecordField(entity.freePulls);
        this._free6 = new NumberRecordField(entity.free6);
        this._free5 = new NumberRecordField(entity.free5);
        this._freeWin5050 = new NumberRecordField(entity.freeWin5050);
    }

    public get bannerId(): string {
        return this._bannerId;
    }

    public get totalUsers(): NumberRecordField {
        return this._totalUsers;
    }

    public get unfreePulls(): NumberRecordField {
        return this._unfreePulls;
    }

    public get total6(): NumberRecordField {
        return this._total6;
    }

    public get total5(): NumberRecordField {
        return this._total5;
    }

    public get won5050(): NumberRecordField {
        return this._won5050;
    }

    public get total5050(): NumberRecordField {
        return this._total5050;
    }

    public get freePulls(): NumberRecordField {
        return this._freePulls;
    }

    public get free6(): NumberRecordField {
        return this._free6;
    }

    public get free5(): NumberRecordField {
        return this._free5;
    }

    public get freeWin5050(): NumberRecordField {
        return this._freeWin5050;
    }
}