import { IEntityClass } from "@models/IEntityClass";
import { CharPullEntity } from "@models/pulls/entities/CharPullEntity";
import { Pull } from "@models/pulls/Pull";
import { StablePull } from "@models/stablePullId/StablePull";
import { CharPullData } from "@services/bannerDataFetcher/entities/CharPullData";

export class CharPull extends Pull implements IEntityClass<CharPullEntity> {
    private readonly _charId: string;
    private readonly _charName: string;
    private readonly _isFree: boolean;

    private constructor(poolId: string, rarity: number, isNew: boolean, gachaTs: string, seqId: string, charId: string, charName: string, isFree: boolean) {
        super(poolId, rarity, isNew, gachaTs, seqId);
        this._charId = charId;
        this._charName = charName;
        this._isFree = isFree;
    }

    public static createFromData(data: CharPullData): CharPull {
        return new CharPull(
            data.poolId,
            data.rarity,
            data.isNew,
            data.gachaTs,
            data.seqId,
            data.charId,
            data.charName,
            data.isFree
        );
    }

    public static createFromEntity(entity: CharPullEntity): CharPull {
        return new CharPull(
            entity.bannerId,
            entity.rarity,
            entity.isNew,
            entity.gachaTs,
            entity.seqId,
            entity.charId,
            entity.charName,
            entity.isFree
        );
    }

    public get charId(): string {
        return this._charId;
    }

    public get charName(): string {
        return this._charName;
    }

    public get isFree(): boolean {
        return this._isFree;
    }

    public getEntity(): CharPullEntity {
        return {
            charId: this._charId,
            charName: this._charName,
            isFree: this._isFree,
            rarity: this.rarity,
            isNew: this.isNew,
            bannerId: this.bannerId,
            gachaTs: this.gachaTs,
            seqId: this.seqId
        };
    }

    public getStablePull(): StablePull {
        return new StablePull(
            this._charId,
            this._isFree,
            this.bannerId,
            this.rarity,
            this.isNew,
            this.gachaTs,
            this.seqId
        );
    }
}