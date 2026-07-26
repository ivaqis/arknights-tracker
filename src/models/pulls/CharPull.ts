import { IEntityClass } from "@models/IEntityClass";
import { CharPullEntity } from "@models/pulls/entities/CharPullEntity";
import { Pull } from "@models/pulls/Pull";
import { CharPullData } from "@services/bannerDataFetcher/entities/CharPullData";

export class CharPull extends Pull implements IEntityClass<CharPullEntity> {
    private readonly _charId: string;
    private readonly _charName: string;
    private readonly _isFree: boolean;

    public constructor(charPullEntity: CharPullData) {
        super(charPullEntity);

        this._charId = charPullEntity.charId;
        this._charName = charPullEntity.charName;
        this._isFree = charPullEntity.isFree;
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
            isFree: this._isFree,
            rarity: this.rarity,
            isNew: this.isNew,
            bannerId: this.bannerId,
            gachaTs: this.gachaTs,
            seqId: this.seqId
        };
    }
}