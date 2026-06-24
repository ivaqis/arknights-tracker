import { BannerRequestParams } from "@models/urlParams/banners/BannerRequestParams";
import { WeaponBannerURLParams } from "@services/bannerDataFetcher/contracts/WeaponBannerURLParams";

export class WeaponBannerRequestParams extends BannerRequestParams {
    private readonly _poolId?: string;

    constructor(urlParams: WeaponBannerURLParams) {
        super(urlParams);

        this._poolId = urlParams.poolId;
    }

    public get poolId(): string | undefined {
        return this._poolId;
    }

    protected getInitParams(): Record<string, string> {
        const params = super.getInitParams();

        if (this.poolId) {
            params.pool_id = this.poolId;
        }

        return params;
    }
}