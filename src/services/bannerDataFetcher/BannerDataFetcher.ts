import { BannerType } from "@models/banners/BannerType";
import { LastPullsMap } from "@services/bannerDataFetcher/LastPullsMap";

export class BannerDataFetcher {
    public static readonly LANG = "en-us";
    public static readonly CHAR_API_URL = "https://ef-webview.gryphline.com/api/record/char";
    public static readonly WEAPON_API_URL = "https://ef-webview.gryphline.com/api/record/weapon";

    private readonly _token: string;
    private readonly _serverId: number;
    private readonly _lastPullsMap: LastPullsMap;

    constructor(token: string, serverId: number, lastPullsMap: LastPullsMap) {
        this._token = token;
        this._serverId = serverId;
        this._lastPullsMap = lastPullsMap;
    }

    private static getApiUrl(bannerType: BannerType) {
        if (bannerType === BannerType.WEAPON) {
            return BannerDataFetcher.WEAPON_API_URL;
        }

        return BannerDataFetcher.CHAR_API_URL;
    }
}