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

    public constructor(token: string, serverId: string, lastPullsMap: LastPullsMap) {
        this._token = token;
        this._serverId = serverId;
        this._lastPullsMap = lastPullsMap;
    }

    public async getAllBannersData(): Promise<BannersPulls> {
        const standardPulls = await this.getCharPulls(BannerType.CHAR_STANDARD);
        const beginnerPulls = await this.getCharPulls(BannerType.CHAR_BEGINNER);
        const specialPulls = await this.getCharPulls(BannerType.CHAR_SPECIAL);
        const jointPulls = await this.getCharPulls(BannerType.CHAR_JOINT);
        const weaponPulls = await this.getWeaponPulls();

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

    private async getCharPulls(bannerType: BannerType): Promise<CharPull[]> {
        const bannerData = await BannerDataFetcher.getBannerData<CharPullEntity, CharBannerRequestParams>(
            BannerDataFetcher.CHAR_API_URL,
            this.getCharRequestParams(bannerType),
            this._lastPullsMap[bannerType] ?? 0n
        );

        if (bannerData.error) {
            console.error(bannerData.error);
            return [];
        }

        return bannerData.list
            .map((entity) => new CharPull(entity));
    }

    private async getWeaponPulls(): Promise<WeaponPull[]> {
        const bannerData = await BannerDataFetcher.getBannerData<WeaponPullEntity, WeaponBannerRequestParams>(
            BannerDataFetcher.WEAPON_API_URL,
            this.getWeaponRequestParams(),
            this._lastPullsMap[BannerType.WEAPON] ?? 0n
        );

        if (bannerData.error) {
            console.error(bannerData.error);
            return [];
        }

        return bannerData.list
            .map((entity) => new WeaponPull(entity));
    }

    private static getBannerData<T extends PullEntity, U extends BannerRequestParams>(url: string, urlParams: U, lastPullTimeMs: bigint) {
        const fetcher = new PullsFetcher<T, U>(url, urlParams, lastPullTimeMs);

        return fetcher.getPullsList();
    }
}