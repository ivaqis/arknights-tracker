import { logger } from "@/logger";
import { BannerType } from "@models/banners/BannerType";
import { BannerRequestParams } from "@models/urlParams/banners/BannerRequestParams";
import { CharBannerRequestParams } from "@models/urlParams/banners/CharBannerRequestParams";
import { WeaponBannerRequestParams } from "@models/urlParams/banners/WeaponBannerRequestParams";
import { BannersPullsData } from "@services/bannerDataFetcher/BannersPullsData";
import { BannerURLParams } from "@services/bannerDataFetcher/contracts/BannerURLParams";
import { CharBannerURLParams } from "@services/bannerDataFetcher/contracts/CharBannerURLParams";
import { WeaponBannerURLParams } from "@services/bannerDataFetcher/contracts/WeaponBannerURLParams";
import { CharPullData } from "@services/bannerDataFetcher/entities/CharPullData";
import { PullData } from "@services/bannerDataFetcher/entities/PullData";
import { WeaponPullData } from "@services/bannerDataFetcher/entities/WeaponPullData";
import { PullsFetcher } from "@services/bannerDataFetcher/PullsFetcher";

export class BannerDataFetcher {
    public static readonly LANG = "en-us";
    public static readonly CHAR_API_URL = "https://ef-webview.gryphline.com/api/record/char";
    public static readonly WEAPON_API_URL = "https://ef-webview.gryphline.com/api/record/weapon";

    private readonly _token: string;
    private readonly _serverId: string;
    private readonly _lastPullTs: number;
    private readonly _callbackFn?: (type: BannerType, count: number) => void;

    public constructor(token: string, serverId: string, lastPullTs: number, callbackFn?: (type: BannerType, count: number) => void) {
        this._token = token;
        this._serverId = serverId;
        this._lastPullTs = lastPullTs;
        this._callbackFn = callbackFn;
    }

    public async getAllBannersData(): Promise<BannersPullsData | null> {
        const isTokenValid = await this.testToken();

        if (!isTokenValid) {
            return null;
        }

        const [standardPulls, beginnerPulls, specialPulls, jointPulls, weaponPulls] = await Promise.all([
            this.getCharPulls(BannerType.CHAR_STANDARD),
            this.getCharPulls(BannerType.CHAR_BEGINNER),
            this.getCharPulls(BannerType.CHAR_SPECIAL),
            this.getCharPulls(BannerType.CHAR_JOINT),
            this.getWeaponPulls()
        ]);

        return {
            [BannerType.CHAR_STANDARD]: standardPulls,
            [BannerType.CHAR_BEGINNER]: beginnerPulls,
            [BannerType.CHAR_SPECIAL]: specialPulls,
            [BannerType.CHAR_JOINT]: jointPulls,
            [BannerType.WEAPON]: weaponPulls
        };
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
            this.getCharRequestParams(BannerType.CHAR_SPECIAL),
            0n
        );

        return await fetcher.test();
    }

    private async getCharPulls(bannerType: BannerType): Promise<CharPullData[]> {
        const bannerData = await BannerDataFetcher.getBannerData<CharPullData, CharBannerRequestParams>(
            BannerDataFetcher.CHAR_API_URL,
            this.getCharRequestParams(bannerType),
            BigInt(this._lastPullTs),
            (count) => this._callbackFn?.(bannerType, count)
        );

        if (bannerData.error) {
            logger.error(bannerData.error);
            return [];
        }

        return bannerData.list;
    }

    private async getWeaponPulls(): Promise<WeaponPullData[]> {
        const bannerData = await BannerDataFetcher.getBannerData<WeaponPullData, WeaponBannerRequestParams>(
            BannerDataFetcher.WEAPON_API_URL,
            this.getWeaponRequestParams(),
            BigInt(this._lastPullTs),
            (count) => this._callbackFn?.(BannerType.WEAPON, count)
        );

        if (bannerData.error) {
            logger.error(bannerData.error);
            return [];
        }

        return bannerData.list;
    }

    private static getBannerData<T extends PullData, U extends BannerRequestParams>(url: string, urlParams: U, lastPullTimeMs: bigint, callbackFn?: (count: number) => void) {
        const fetcher = new PullsFetcher<T, U>(url, urlParams, lastPullTimeMs, callbackFn);

        return fetcher.getPullsList();
    }
}