import { DetailRequestParams } from "@models/urlParams/skportAccountData/DetailRequestParams.js";
import { WarEchoesURLParams } from "@services/warEchoesFetcher/contracts/WarEchoesURLParams.js";

export class WarEchoesRequestParams extends DetailRequestParams {
    private readonly _userId: string;

    public constructor(urlParams: WarEchoesURLParams) {
        super(urlParams);

        this._userId = urlParams.userId;
    }

    public get userId(): string {
        return this._userId;
    }

    protected getInitParams(): Record<string, string> {
        let params = super.getInitParams();
        params.userId = this._userId;

        return params;
    }
}
