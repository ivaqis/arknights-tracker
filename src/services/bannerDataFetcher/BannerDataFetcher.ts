import { logger } from "@/logger";
import { BannerType } from "@models/banners/BannerType";
import { CharPull } from "@models/pulls/CharPull";
import { WeaponPull } from "@models/pulls/WeaponPull";
import { BannerRequestParams } from "@models/urlParams/banners/BannerRequestParams";
import { CharBannerRequestParams } from "@models/urlParams/banners/CharBannerRequestParams";
import { WeaponBannerRequestParams } from "@models/urlParams/banners/WeaponBannerRequestParams";
import { BannersPulls } from "@services/bannerDataFetcher/BannersPulls";
import { BannerURLParams } from "@services/bannerDataFetcher/contracts/BannerURLParams";
import { CharBannerURLParams } from "@services/bannerDataFetcher/contracts/CharBannerURLParams";
import { WeaponBannerURLParams } from "@services/bannerDataFetcher/contracts/WeaponBannerURLParams";
import { CharPullEntity } from "@services/bannerDataFetcher/entities/CharPullEntity";
import { PullEntity } from "@services/bannerDataFetcher/entities/PullEntity";
import { WeaponPullEntity } from "@services/bannerDataFetcher/entities/WeaponPullEntity";
import { LastPullsMap } from "@services/bannerDataFetcher/LastPullsMap";
import { PullsFetcher } from "@services/bannerDataFetcher/PullsFetcher";

export class BannerDataFetcher {
    public static readonly LANG = "en-us";
    public static readonly CHAR_API_URL = "https://ef-webview.gryphline.com/api/record/char";
    public static readonly WEAPON_API_URL = "https://ef-webview.gryphline.com/api/record/weapon";

    private readonly _token: string;
    private readonly _serverId: string;
    private readonly _lastPullsMap: LastPullsMap;
    private readonly _callbackFn?: (type: BannerType, count: number) => void;

    public constructor(token: string, serverId: string, lastPullsMap: LastPullsMap, callbackFn?: (type: BannerType, count: number) => void) {
        this._token = token;
        this._serverId = serverId;
        this._lastPullsMap = lastPullsMap;
        this._callbackFn = callbackFn;
    }

    public async getAllBannersData(): Promise<BannersPulls | null> {
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

    private async getCharPulls(bannerType: BannerType): Promise<CharPull[]> {
        const bannerData = await BannerDataFetcher.getBannerData<CharPullEntity, CharBannerRequestParams>(
            BannerDataFetcher.CHAR_API_URL,
            this.getCharRequestParams(bannerType),
            this._lastPullsMap[bannerType] ?? 0n,
            (count) => this._callbackFn?.(bannerType, count)
        );

        if (bannerData.error) {
            logger.error(bannerData.error);
            return [];
        }

        return bannerData.list
            .map((entity) => new CharPull(entity));
    }

    private async getWeaponPulls(): Promise<WeaponPull[]> {
        const bannerData = await BannerDataFetcher.getBannerData<WeaponPullEntity, WeaponBannerRequestParams>(
            BannerDataFetcher.WEAPON_API_URL,
            this.getWeaponRequestParams(),
            this._lastPullsMap[BannerType.WEAPON] ?? 0n,
            (count) => this._callbackFn?.(BannerType.WEAPON, count)
        );

        if (bannerData.error) {
            logger.error(bannerData.error);
            return [];
        }

        return bannerData.list
            .map((entity) => new WeaponPull(entity));
    }

    private static getBannerData<T extends PullEntity, U extends BannerRequestParams>(url: string, urlParams: U, lastPullTimeMs: bigint, callbackFn?: (count: number) => void) {
        const fetcher = new PullsFetcher<T, U>(url, urlParams, lastPullTimeMs, callbackFn);

        return fetcher.getPullsList();
    }
}