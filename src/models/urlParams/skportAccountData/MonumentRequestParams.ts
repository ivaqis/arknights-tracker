import { DetailRequestParams } from "@models/urlParams/skportAccountData/DetailRequestParams";
import { MonumentURLParams } from "@services/monumentFetcher/contracts/MonumentURLParams";

export class MonumentRequestParams extends DetailRequestParams {
    private readonly _userId: string;

    public constructor(urlParams: MonumentURLParams) {
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