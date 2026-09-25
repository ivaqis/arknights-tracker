import { GlobalBannerStatsEntity } from "@database/entities/GlobalBannerStatsEntity.js";

export class GlobalBannerStats {
    private readonly _bannerId: string;
    private readonly _totalUsers: number;
    private readonly _unfreePulls: number;
    private readonly _total6: number;
    private readonly _total5: number;
    private readonly _won5050: number;
    private readonly _total5050: number;
    private readonly _freePulls: number;
    private readonly _free6: number;
    private readonly _free5: number;
    private readonly _freeWin5050: number;
    private readonly _updatedAt: Date;

    private constructor(bannerId: string, totalUsers: number, unfreePulls: number, total6: number, total5: number, won5050: number, total5050: number, freePulls: number, free6: number, free5: number, freeWin5050: number, updatedAt: Date) {
        this._bannerId = bannerId;
        this._totalUsers = totalUsers;
        this._unfreePulls = unfreePulls;
        this._total6 = total6;
        this._total5 = total5;
        this._won5050 = won5050;
        this._total5050 = total5050;
        this._freePulls = freePulls;
        this._free6 = free6;
        this._free5 = free5;
        this._freeWin5050 = freeWin5050;
        this._updatedAt = updatedAt;
    }

    public static createFromEntity(entity: GlobalBannerStatsEntity): GlobalBannerStats {
        return new GlobalBannerStats(
            entity.bannerId,
            entity.totalUsers,
            entity.unfreePulls,
            entity.total6,
            entity.total5,
            entity.won5050,
            entity.total5050,
            entity.freePulls,
            entity.free6,
            entity.free5,
            entity.freeWin5050,
            entity.updatedAt
        );
    }

    public get bannerId(): string {
        return this._bannerId;
    }

    public get totalUsers(): number {
        return this._totalUsers;
    }

    public get unfreePulls(): number {
        return this._unfreePulls;
    }

    public get total6(): number {
        return this._total6;
    }

    public get total5(): number {
        return this._total5;
    }

    public get won5050(): number {
        return this._won5050;
    }

    public get total5050(): number {
        return this._total5050;
    }

    public get freePulls(): number {
        return this._freePulls;
    }

    public get free6(): number {
        return this._free6;
    }

    public get free5(): number {
        return this._free5;
    }

    public get freeWin5050(): number {
        return this._freeWin5050;
    }

    public get updatedAt(): Date {
        return this._updatedAt;
    }

    public get totalPulls(): number {
        return this.unfreePulls + this.freePulls;
    }

    public get featured(): number {
        return this.total6 - this.total5050 + this.won5050;
    }

    public get guaranteed(): number {
        return this.total6 - this.total5050;
    }

    public get winrate(): number {
        return this.won5050 / this.total5050;
    }

    public get freeWinrate(): number {
        return this.freeWin5050 / this.free6
    }

    public get unfree6(): number {
        return this.total6 - this.free6;
    }

    public get unfree5(): number {
        return this.total5 - this.free5;
    }
}