import { config } from "@/config.js";
import { logger } from "@/logger.js";
import { BadResponseDataCodeError } from "@errors/BadResponseDataCodeError.js";
import { WarEchoesRequestParams } from "@models/urlParams/skportAccountData/WarEchoesRequestParams.js";
import { WarEchoesSeasonData } from "@services/warEchoesFetcher/contracts/WarEchoesSeasonData.js";
import { WarEchoesResponse } from "@services/warEchoesFetcher/contracts/WarEchoesResponse.js";
import { CredData } from "@services/skportAuth/contracts/CredData.js";
import { generateSign, getTimestampNow } from "@utils/skportUtils.js";
import axios, { AxiosResponse } from "axios";

export class WarEchoesFetcher {
    private static readonly _skportEchoUrl = config.skportEchoUrl as string;
    private static readonly _skportEchoPath = config.skportEchoPath as string;

    private readonly _serverId: string;
    private readonly _roleId: string;
    private readonly _token: string;
    private readonly _cred: string;

    private readonly _urlParams: WarEchoesRequestParams;

    private _timestamp: string = "0";

    public constructor(roleData: { serverId: string, roleId: string }, credData: CredData) {
        if (!WarEchoesFetcher._skportEchoUrl) {
            throw new Error("skportEchoUrl is not provided");
        }

        this._serverId = roleData.serverId;
        this._roleId = roleData.roleId;
        this._token = credData.token;
        this._cred = credData.cred;

        this._urlParams = new WarEchoesRequestParams({
            serverId: roleData.serverId,
            roleId: roleData.roleId,
            userId: ""
        });
    }

    public static create(roleData: { serverId: string, roleId: string },
                         credData: CredData
    ): WarEchoesFetcher | null {
        let fetcher: WarEchoesFetcher;

        try {
            fetcher = new WarEchoesFetcher(roleData, credData);
        } catch (e) {
            logger.error(e);

            if (e instanceof Error) {
                logger.error(e.stack);
            }

            return null;
        }

        return fetcher;
    }

    public static async getWarEchoesDataList(roleData: { serverId: string, roleId: string },
                                             credData: CredData
    ): Promise<WarEchoesSeasonData[] | null> {
        let fetcher = this.create(roleData, credData);

        if (!fetcher) {
            return null;
        }

        return fetcher.getWarEchoesDataList();
    }

    public async getWarEchoesDataList(): Promise<WarEchoesSeasonData[] | null> {
        let responseData: WarEchoesResponse;

        try {
            responseData = await this.getResponseData();
        } catch (e) {
            logger.error(e);

            if (e instanceof Error) {
                logger.error(e.stack);
            }

            return null;
        }

        let data = responseData.data?.warEchoes?.seasons;

        if (!data) {
            return null;
        }

        return data;
    }

    private async getResponseData(): Promise<WarEchoesResponse> {
        logger.info("WarEchoesFetcher: Getting response data");

        this.initTimestamp();

        let resp: AxiosResponse<WarEchoesResponse>;

        try {
            resp = await axios.get(
                this.getFullUrl(),
                this.getConfig()
            );
        } catch (e) {
            throw e;
        }

        logger.info("WarEchoesFetcher: Response data received");

        if (resp.data.code !== 0) {
            throw new BadResponseDataCodeError(resp.data.code, resp.data);
        }

        return resp.data;
    }

    private getFullUrl(): string {
        return `${WarEchoesFetcher._skportEchoUrl}?${this._urlParams.getParamString()}`;
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

    private getSign() {
        return generateSign(
            WarEchoesFetcher._skportEchoPath,
            this._urlParams.getParamString(),
            this._timestamp,
            this._token
        );
    }

    private initTimestamp() {
        this._timestamp = getTimestampNow();
    }
}
