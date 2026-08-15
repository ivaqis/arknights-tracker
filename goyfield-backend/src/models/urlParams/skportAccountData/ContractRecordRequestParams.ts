import { ContractRequestParams } from "@models/urlParams/skportAccountData/ContractRequestParams.js";
import { ContractRecordURLParams } from "@services/contractRecordFetcher/contracts/ContractRecordURLParams.js";

export class ContractRecordRequestParams extends ContractRequestParams {
    private _recordId: string;

    public constructor(urlParams: ContractRecordURLParams) {
        super(urlParams);

        this._recordId = urlParams.recordId;
    }

    public get recordId(): string {
        return this._recordId;
    }

    public set recordId(value: string) {
        this._recordId = value;
    }

    protected getInitParams(): Record<string, string> {
        let params = super.getInitParams();
        params.recordId = this._recordId;

        return params;
    }
}