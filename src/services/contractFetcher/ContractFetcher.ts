import { config } from "@/config";
import { logger } from "@/logger";
import { BadResponseDataCodeError } from "@errors/BadResponseDataCodeError";
import { ContractRequestParams } from "@models/urlParams/skportAccountData/ContractRequestParams";
import { ContractData } from "@services/contractFetcher/contracts/ContractData";
import { ContractResponse } from "@services/contractFetcher/contracts/ContractResponse";
import { CredData } from "@services/skportAuth/contracts/CredData";
import { generateSign, getTimestampNow } from "@utils/skportUtils";
import axios, { AxiosResponse } from "axios";

export class ContractFetcher {
    private static readonly _skportContractUrl = config.skportContractUrl as string;
    private static readonly _skportContractPath = config.skportContractPath as string;

    private readonly _roleId: string;
    private readonly _serverId: string;
    private readonly _contractId: string;
    private readonly _token: string;
    private readonly _cred: string;

    private readonly _urlParams: ContractRequestParams;

    private _timestamp: string = "0";

    public constructor(roleData: { serverId: string, roleId: string }, credData: CredData, contractId: string) {
        if (!ContractFetcher._skportContractUrl) {
            throw new Error("skportContractUrl is not provided");
        }

        this._serverId = roleData.serverId;
        this._roleId = roleData.roleId;
        this._contractId = contractId;
        this._token = credData.token;
        this._cred = credData.cred;

        this._urlParams = new ContractRequestParams({
            roleId: roleData.roleId,
            serverId: roleData.serverId,
            contractId: contractId,
            userId: ""
        });
    }

    public async getContractData(): Promise<ContractData | null> {
        let responseData: ContractResponse;

        try {
            responseData = await this.getResponseData();
        } catch (error) {
            logger.error(error);

            return null;
        }

        return responseData.data.crisisContract;
    }

    private async getResponseData(): Promise<ContractResponse> {
        logger.info("ContractFetcher: Getting response data");

        this.initTimestamp();

        let resp: AxiosResponse<ContractResponse>;

        try {
            resp = await axios.get(
                this.getFullUrl(),
                this.getConfig()
            );
        } catch (error) {
            throw error;
        }

        logger.info("ContractFetcher: Response data received");

        if (resp.data.code !== 0) {
            throw new BadResponseDataCodeError(resp.data.code, resp.data);
        }

        return resp.data;
    }

    private initTimestamp() {
        this._timestamp = getTimestampNow();
    }

    private getSign() {
        return generateSign(
            ContractFetcher._skportContractPath,
            this._urlParams.getParamString(),
            this._timestamp,
            this._token
        );
    }

    private getConfig() {
        return {
            headers: {
                "Accept": "application/json",
                "cred": this._cred,
                "sign": this.getSign(),
                "platform": "3",
                "timestamp": this._timestamp,
                "vname": "1.0.0",
                "sk-language": "en_US",
                "User-Agent": "Mozilla/5.0"
            }
        };
    }

    private getFullUrl() {
        return `${ContractFetcher._skportContractUrl}?${this._urlParams.getParamString()}`;
    }
}