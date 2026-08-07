import { URLRequestParams } from "@models/urlParams/URLRequestParams.js";
import { BannerURLParams } from "@services/bannerDataFetcher/contracts/BannerURLParams.js";

export class BannerRequestParams extends URLRequestParams {
    private readonly _token: string;
    private readonly _lang: string;
    private readonly _serverId: string;

    private _seqId?: string;

    public constructor(urlParams: BannerURLParams) {
        super();

        this._token = urlParams.token;
        this._lang = urlParams.lang;
        this._serverId = urlParams.serverId;
        this._seqId = urlParams.seqId;
    }


    public get token(): string {
        return this._token;
    }

    public get lang(): string {
        return this._lang;
    }

    public get serverIdString(): string {
        return this._serverId;
    }

    public get serverId(): string {
        return this._serverId;
    }

    public get seqId(): string | undefined {
        return this._seqId;
    }

    public set seqId(value: string) {
        this._seqId = value;
    }

    protected getInitParams() {
        const params: Record<string, string> = {
            token: this.token,
            lang: this.lang,
            server_id: this.serverIdString,
        };

        if (this.seqId) {
            params.seq_id = this.seqId;
        }

        return params;
    }
}