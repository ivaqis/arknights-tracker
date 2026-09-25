import { config } from "@/config.js";
import { logger } from "@/logger.js";
import { BadResponseDataCodeError } from "@errors/BadResponseDataCodeError.js";
import { DetailRequestParams } from "@models/urlParams/skportAccountData/DetailRequestParams.js";
import { CredData } from "@services/skportAuth/contracts/CredData.js";
import { DetailData } from "@services/skportDetailFetcher/contracts/DetailData.js";
import { SkportDetailResponse } from "@services/skportDetailFetcher/contracts/SkportDetailResponse.js";
import { generateSign, getTimestampNow } from "@utils/skportUtils.js";
import axios, { AxiosResponse } from "axios";

export class SkportDetailFetcher {
    private static readonly _skportDetailUrl = config.skportDetailUrl as string;
    private static readonly _skportDetailPath = config.skportDetailPath as string;

    private readonly _serverId: string;
    private readonly _roleId: string;
    private readonly _token: string;
    private readonly _cred: string;

    private readonly _urlParams: DetailRequestParams;

    private _timestamp: string = "0";

    public constructor(roleData: { serverId: string, roleId: string }, credData: CredData) {
        if (!SkportDetailFetcher._skportDetailUrl) {
            throw new Error("skportDetailUrl is not provided");
        }

        this._serverId = roleData.serverId;
        this._roleId = roleData.roleId;
        this._token = credData.token;
        this._cred = credData.cred;

        this._urlParams = new DetailRequestParams({
            serverId: roleData.serverId,
            roleId: roleData.roleId
        });
    }

    public static create(roleData: { serverId: string, roleId: string },
                         credData: CredData
    ): SkportDetailFetcher | null {
        let fetcher: SkportDetailFetcher;

        try {
            fetcher = new SkportDetailFetcher(roleData, credData);
        } catch (error) {
            logger.error(error);

            return null;
        }

        return fetcher;
    }

    public static async getDetailData(roleData: { serverId: string, roleId: string },
                                      credData: CredData
    ): Promise<DetailData | null> {
        const fetcher = this.create(roleData, credData);

        if (!fetcher) {
            return null;
        }

        return fetcher.getDetailData();
    }

    public async getDetailData(): Promise<DetailData | null> {
        let responseData: SkportDetailResponse;

        try {
            responseData = await this.getResponseData();
        } catch (error) {
            logger.error(error);

            return null;
        }

        let data = responseData.data?.detail;

        if (!data) {
            return null;
        }

        return data;
    }

    private async getResponseData(): Promise<SkportDetailResponse> {
        logger.info("SkportDetailFetcher: Getting response data");

        this.initTimestamp();

        let resp: AxiosResponse<SkportDetailResponse>;

        try {
            resp = await axios.get(
                this.getFullUrl(),
                this.getConfig()
            );
        } catch (error) {
            throw error;
        }

        logger.info("SkportDetailFetcher: Response data received");

        if (resp.data.code !== 0) {
            throw new BadResponseDataCodeError(resp.data.code, resp.data);
        }

        return resp.data;
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
            SkportDetailFetcher._skportDetailPath,
            this._urlParams.getParamString(),
            this._timestamp,
            this._token
        );
    }

    private initTimestamp() {
        this._timestamp = getTimestampNow();
    }

    private getFullUrl() {
        return `${SkportDetailFetcher._skportDetailUrl}?${this._urlParams.getParamString()}`;
    }
}