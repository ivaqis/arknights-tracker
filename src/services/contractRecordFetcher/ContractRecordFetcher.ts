import { config } from "@/config";
import { logger } from "@/logger";
import { BadResponseDataCodeError } from "@errors/BadResponseDataCodeError";
import { ContractRecordRequestParams } from "@models/urlParams/skportAccountData/ContractRecordRequestParams";
import { ContractRecordDetailData } from "@services/contractRecordFetcher/contracts/ContractRecordDetailData";
import { ContractRecordResponse } from "@services/contractRecordFetcher/contracts/ContractRecordResponse";
import { CredData } from "@services/skportAuth/contracts/CredData";
import { generateSign, getTimestampNow } from "@utils/skportUtils";
import axios, { AxiosResponse } from "axios";

export class ContractRecordFetcher {
    private static readonly _skportContractRecordsUrl = config.skportContractRecordsUrl as string;
    private static readonly _skportContractRecordsPath = config.skportContractRecordsPath as string;

    private readonly _roleId: string;
    private readonly _serverId: string;
    private readonly _contractId: string;
    private readonly _token: string;
    private readonly _cred: string;
    private readonly _recordId: string;

    private readonly _urlParams: ContractRecordRequestParams;

    private _timestamp: string = "0";

    public constructor(roleData: { serverId: string, roleId: string },
                       credData: CredData,
                       contractId: string,
                       recordId: string
    ) {
        if (!ContractRecordFetcher._skportContractRecordsUrl) {
            throw new Error("skportContractRecordsUrl is not provided");
        }

        this._serverId = roleData.serverId;
        this._roleId = roleData.roleId;
        this._contractId = contractId;
        this._token = credData.token;
        this._cred = credData.cred;
        this._recordId = recordId;

        this._urlParams = new ContractRecordRequestParams({
            roleId: roleData.roleId,
            serverId: roleData.serverId,
            contractId: contractId,
            recordId: recordId,
            userId: ""
        });
    }

    public static async getContractRecordDetail(roleData: { serverId: string, roleId: string },
                                                credData: CredData,
                                                contractId: string,
                                                recordId: string
    ): Promise<ContractRecordDetailData | null> {
        let fetcher: ContractRecordFetcher;

        try {
            fetcher = new ContractRecordFetcher(roleData, credData, contractId, recordId);
        } catch (error) {
            logger.error(error);

            return null;
        }

        return fetcher.getContractRecordData();
    }

    public async getContractRecordData(): Promise<ContractRecordDetailData | null> {
        let responseData: ContractRecordResponse;

        try {
            responseData = await this.getResponseData();
        } catch (error) {
            logger.error(error);

            return null;
        }

        return responseData.data.recordDetail;
    }

    private async getResponseData(): Promise<ContractRecordResponse> {
        logger.info("ContractRecordFetcher: Getting response data");

        this.initTimestamp();

        let resp: AxiosResponse<ContractRecordResponse>;

        try {
            resp = await axios.get(
                this.getFullUrl(),
                this.getConfig()
            );
        } catch (e) {
            throw e;
        }

        logger.info("ContractRecordFetcher: Response data received");

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
            ContractRecordFetcher._skportContractRecordsPath,
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
        return `${ContractRecordFetcher._skportContractRecordsUrl}?${this._urlParams.getParamString()}`;
    }
}