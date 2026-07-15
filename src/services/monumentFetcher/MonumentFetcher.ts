import { config } from "@/config";
import { logger } from "@/logger";
import { BadResponseDataCodeError } from "@errors/BadResponseDataCodeError";
import { MonumentRequestParams } from "@models/urlParams/skportAccountData/MonumentRequestParams";
import { MonumentGroupData } from "@services/monumentFetcher/contracts/MonumentGroupData";
import { MonumentResponse } from "@services/monumentFetcher/contracts/MonumentResponse";
import { CredData } from "@services/skportAuth/contracts/CredData";
import { generateSign, getTimestampNow } from "@utils/skportUtils";
import axios, { AxiosResponse } from "axios";

export class MonumentFetcher {
    private static readonly _skportMonumentUrl = config.skportMonumentUrl as string;
    private static readonly _skportMonumentPath = config.skportMonumentPath as string;

    private readonly _serverId: string;
    private readonly _roleId: string;
    private readonly _token: string;
    private readonly _cred: string;

    private readonly _urlParams: MonumentRequestParams;

    private _timestamp: string = "0";

    public constructor(roleData: { serverId: string, roleId: string }, credData: CredData) {
        if (!MonumentFetcher._skportMonumentUrl) {
            throw new Error("skportMonumentUrl is not provided");
        }

        this._serverId = roleData.serverId;
        this._roleId = roleData.roleId;
        this._token = credData.token;
        this._cred = credData.cred;

        this._urlParams = new MonumentRequestParams({
            serverId: roleData.serverId,
            roleId: roleData.roleId,
            userId: ""
        });
    }

    public static create(roleData: { serverId: string, roleId: string },
                         credData: CredData
    ): MonumentFetcher | null {
        let fetcher: MonumentFetcher;

        try {
            fetcher = new MonumentFetcher(roleData, credData);
        } catch (e) {
            logger.error(e);

            if (e instanceof Error) {
                logger.error(e.stack);
            }

            return null;
        }

        return fetcher;
    }

    public static async getMonumentGroupDataList(roleData: { serverId: string, roleId: string },
                                                 credData: CredData
    ): Promise<MonumentGroupData[] | null> {
        let fetcher = this.create(roleData, credData);

        if (!fetcher) {
            return null;
        }

        return fetcher.getMonumentGroupDataList();
    }

    public async getMonumentGroupDataList(): Promise<MonumentGroupData[] | null> {
        let responseData: MonumentResponse;

        try {
            responseData = await this.getResponseData();
        } catch (e) {
            logger.error(e);

            if (e instanceof Error) {
                logger.error(e.stack);
            }

            return null;
        }

        let data = responseData.data?.indieHard?.indieHardGroups;

        if (!data) {
            return null;
        }

        return data;
    }

    private async getResponseData(): Promise<MonumentResponse> {
        logger.info("MonumentFetcher: Getting response data");

        this.initTimestamp();

        let resp: AxiosResponse<MonumentResponse>;

        try {
            resp = await axios.get(
                this.getFullUrl(),
                this.getConfig()
            );
        } catch (e) {
            throw e;
        }

        logger.info("MonumentFetcher: Response data received");

        if (resp.data.code !== 0) {
            throw new BadResponseDataCodeError(resp.data.code, resp.data);
        }

        return resp.data;
    }

    private getFullUrl(): string {
        return `${MonumentFetcher._skportMonumentUrl}?${this._urlParams.getParamString()}`;
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
            MonumentFetcher._skportMonumentPath,
            this._urlParams.getParamString(),
            this._timestamp,
            this._token
        );
    }

    private initTimestamp() {
        this._timestamp = getTimestampNow();
    }
}