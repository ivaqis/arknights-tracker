import { PullData } from "@services/bannerDataFetcher/entities/PullData";

export class Pull {
    private readonly _bannerId: string;
    private readonly _bannerName: string;
    private readonly _rarity: number;
    private readonly _isNew: boolean;
    private readonly _gachaTs: string;
    private readonly _seqId: string;

    public constructor(pullEntity: PullData) {
        this._bannerId = pullEntity.poolId;
        this._bannerName = pullEntity.poolName;
        this._rarity = pullEntity.rarity;
        this._isNew = pullEntity.isNew;
        this._gachaTs = pullEntity.gachaTs;
        this._seqId = pullEntity.seqId;
    }

    public get bannerId(): string {
        return this._bannerId;
    }

    public get bannerName(): string {
        return this._bannerName;
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
}