import { BannerType } from "@models/banners/BannerType";
import { BannersPulls } from "@models/pulls/BannersPulls";
import { CharBannerRequestParams } from "@models/urlParams/banners/CharBannerRequestParams";
import { WeaponBannerRequestParams } from "@models/urlParams/banners/WeaponBannerRequestParams";
import { BannerURLParams } from "@services/bannerDataFetcher/contracts/BannerURLParams";
import { CharBannerURLParams } from "@services/bannerDataFetcher/contracts/CharBannerURLParams";
import { WeaponBannerURLParams } from "@services/bannerDataFetcher/contracts/WeaponBannerURLParams";
import { CharPullData } from "@services/bannerDataFetcher/entities/CharPullData";
import { WeaponPullData } from "@services/bannerDataFetcher/entities/WeaponPullData";
import { PullsFetcher } from "@services/bannerDataFetcher/PullsFetcher";

export class BannerDataFetcher {
    public static readonly LANG = "en-us";
    public static readonly CHAR_API_URL = "https://ef-webview.gryphline.com/api/record/char";
    public static readonly WEAPON_API_URL = "https://ef-webview.gryphline.com/api/record/weapon";

    private readonly _token: string;
    private readonly _serverId: string;
    private readonly _callbackFn?: (type: BannerType, count: number) => void;

    private readonly _standardFetcher: PullsFetcher<CharPullData, CharBannerRequestParams>;
    private readonly _beginnerFetcher: PullsFetcher<CharPullData, CharBannerRequestParams>;
    private readonly _specialFetcher: PullsFetcher<CharPullData, CharBannerRequestParams>;
    private readonly _jointFetcher: PullsFetcher<CharPullData, CharBannerRequestParams>;
    private readonly _weaponFetcher: PullsFetcher<WeaponPullData, WeaponBannerRequestParams>;

    public constructor(token: string, serverId: string, callbackFn?: (type: BannerType, count: number) => void) {
        this._token = token;
        this._serverId = serverId;
        this._callbackFn = callbackFn;

        this._standardFetcher = new PullsFetcher(BannerDataFetcher.CHAR_API_URL, this.getCharRequestParams(BannerType.CHAR_STANDARD), this.getCallbackFn(BannerType.CHAR_STANDARD));
        this._beginnerFetcher = new PullsFetcher(BannerDataFetcher.CHAR_API_URL, this.getCharRequestParams(BannerType.CHAR_BEGINNER), this.getCallbackFn(BannerType.CHAR_BEGINNER));
        this._specialFetcher = new PullsFetcher(BannerDataFetcher.CHAR_API_URL, this.getCharRequestParams(BannerType.CHAR_SPECIAL), this.getCallbackFn(BannerType.CHAR_SPECIAL));
        this._jointFetcher = new PullsFetcher(BannerDataFetcher.CHAR_API_URL, this.getCharRequestParams(BannerType.CHAR_JOINT), this.getCallbackFn(BannerType.CHAR_JOINT));
        this._weaponFetcher = new PullsFetcher(BannerDataFetcher.WEAPON_API_URL, this.getWeaponRequestParams(), this.getCallbackFn(BannerType.WEAPON));
    }

    private getCallbackFn(bannerType: BannerType): (count: number) => void | undefined {
        return (count: number) => this._callbackFn?.(bannerType, count);
    }

    public async getAllBannersData(lastPullTimeMs: number = 0): Promise<BannersPulls | null> {
        const isTokenValid = await this.testToken();

        if (!isTokenValid) {
            return null;
        }

        await Promise.all([
            this._standardFetcher.fetch(lastPullTimeMs),
            this._beginnerFetcher.fetch(lastPullTimeMs),
            this._specialFetcher.fetch(lastPullTimeMs),
            this._jointFetcher.fetch(lastPullTimeMs),
            this._weaponFetcher.fetch(lastPullTimeMs)
        ]);

        return BannersPulls.createFromData({
            [BannerType.CHAR_STANDARD]: this._standardFetcher.pullsList,
            [BannerType.CHAR_BEGINNER]: this._beginnerFetcher.pullsList,
            [BannerType.CHAR_SPECIAL]: this._specialFetcher.pullsList,
            [BannerType.CHAR_JOINT]: this._jointFetcher.pullsList,
            [BannerType.WEAPON]: this._weaponFetcher.pullsList
        });
    }

    private getCharRequestParams(bannerType: BannerType): CharBannerRequestParams {
        const params: CharBannerURLParams = {
            poolType: bannerType,
            ...this.getBannerUrlParams()
        };

        return new CharBannerRequestParams(params);
    }

    private getWeaponRequestParams(bannerId?: string): WeaponBannerRequestParams {
        const params: WeaponBannerURLParams = {
            poolId: bannerId,
            ...this.getBannerUrlParams()
        };

        return new WeaponBannerRequestParams(params);
    }

    private getBannerUrlParams(): BannerURLParams {
        return {
            lang: BannerDataFetcher.LANG,
            token: this._token,
            serverId: this._serverId
        };
    }

    private async testToken(): Promise<boolean> {
        const fetcher = new PullsFetcher(
            BannerDataFetcher.CHAR_API_URL,
            this.getCharRequestParams(BannerType.CHAR_SPECIAL)
        );

        return await fetcher.test();
    }
}