import { ApiBannerType } from "$lib/classes/banners/ApiBannerType";
import { GameBannerType } from "$lib/classes/banners/GameBannerType";
import { type ApiBannerTypeData, bannerTypes } from "$lib/data/bannerTypes";
import { getMap } from "$lib/utils/collectionUtils";

export class BannerType {
    private static readonly bannerTypeById: Map<string, ApiBannerTypeData> = getMap(bannerTypes, item => item.id);

    private readonly _id: ApiBannerType;
    private readonly _gameType: GameBannerType;
    private readonly _name: string | null;
    private readonly _i18nKey: string;
    private readonly _order: number;
    private readonly _showOnHome: boolean;
    private readonly _showInRating: boolean;
    private readonly _color: string | null;

    public constructor(data: ApiBannerTypeData) {
        if (!ApiBannerType.isApiBannerType(data.id)) {
            throw new Error(`ApiBannerTypeData.id is not ApiBannerType: ${data.id}`);
        }

        const gameType = GameBannerType.getByShortName(data.gameType);

        if (!gameType) {
            throw new Error(`ApiBannerTypeData.gameType is not short GameBannerType: ${data.gameType}`);
        }

        this._id = data.id;
        this._gameType = gameType;
        this._i18nKey = data.i18nKey;
        this._order = data.order;
        this._showOnHome = data.showOnHome;
        this._showInRating = data.showInRating;
        this._name = data.name ?? null;
        this._color = data.color ?? null;
    }

    public static getByApiBannerType(apiBannerType: ApiBannerType): BannerType | null {
        const data = this.bannerTypeById.get(apiBannerType);

        return this.create(data);
    }

    private static create(data: ApiBannerTypeData | null | undefined): BannerType | null {
        if (!data) {
            return null;
        }

        return new BannerType(data);
    }

    public get id(): ApiBannerType {
        return this._id;
    }

    public get gameType(): GameBannerType {
        return this._gameType;
    }

    public get name(): string | null {
        return this._name;
    }

    public get i18nKey(): string {
        return this._i18nKey;
    }

    public get order(): number {
        return this._order;
    }

    public get showOnHome(): boolean {
        return this._showOnHome;
    }

    public get showInRating(): boolean {
        return this._showInRating;
    }

    public get color(): string | null {
        return this._color;
    }
}