import { DetailRequestParams } from "@models/urlParams/skportAccountData/DetailRequestParams";
import { ContractURLParams } from "@services/skportContractsFetcher/contracts/ContractURLParams";

export class ContractRequestParams extends DetailRequestParams {
    private readonly _userId: string;
    private readonly _contractId: string;

    public constructor(urlParams: ContractURLParams) {
        super(urlParams);

        this._userId = urlParams.userId;
        this._contractId = urlParams.contractId;
    }

    public get userId(): string {
        return this._userId;
    }

    public get contractId(): string {
        return this._contractId;
    }

    protected getInitParams(): Record<string, string> {
        let params = super.getInitParams();
        params.userId = this._userId;
        params.contractId = this._contractId;

        return params;
    }
}