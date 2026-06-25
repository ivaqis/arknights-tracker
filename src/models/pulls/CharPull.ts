import { Pull } from "@models/pulls/Pull";
import { CharPullEntity } from "@services/bannerDataFetcher/entities/CharPullEntity";

export class CharPull extends Pull {
    private readonly _charId: string;
    private readonly _charName: string;
    private readonly _isFree: boolean;

    public constructor(charPullEntity: CharPullEntity) {
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
}