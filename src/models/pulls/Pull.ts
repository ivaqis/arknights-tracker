import { StablePull } from "@models/stablePullId/StablePull.js";

export abstract class Pull {
    private readonly _bannerId: string;
    private readonly _rarity: number;
    private readonly _isNew: boolean;
    private readonly _gachaTs: string;
    private readonly _seqId: string;

    protected constructor(poolId: string, rarity: number, isNew: boolean, gachaTs: string, seqId: string) {
        this._bannerId = poolId;
        this._rarity = rarity;
        this._isNew = isNew;
        this._gachaTs = gachaTs;
        this._seqId = seqId;
    }

    public get bannerId(): string {
        return this._bannerId;
    }

    public get rarity(): number {
        return this._rarity;
    }

    public get isNew(): boolean {
        return this._isNew;
    }

    public get gachaTs(): string {
        return this._gachaTs;
    }

    public get gachaTsNumber(): number {
        try {
            return Number(this._gachaTs);
        } catch (e) {
            return 0;
        }
    }

    public get gachaTsBigint(): bigint {
        try {
            return BigInt(this._gachaTs);
        } catch (e) {
            return 0n;
        }
    }

    public get seqId(): string {
        return this._seqId;
    }

    public get seqIdNumber(): number {
        try {
            return Number(this._seqId);
        } catch (e) {
            return 0;
        }
    }

    public abstract getStablePull(): StablePull;
}