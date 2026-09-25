import { BannerRequestParams } from "@models/urlParams/banners/BannerRequestParams.js";
import { CharBannerURLParams } from "@services/bannerDataFetcher/contracts/CharBannerURLParams.js";


export class CharBannerRequestParams extends BannerRequestParams {
    private readonly _poolType: string;

    public constructor(urlParams: CharBannerURLParams) {
        super(urlParams);

        this._poolType = urlParams.poolType;
    }

    public get poolType(): string {
        return this._poolType;
    }

    protected getInitParams(): Record<string, string> {
        const params = super.getInitParams();

        params.pool_type = this.poolType;

        return params;
    }
}