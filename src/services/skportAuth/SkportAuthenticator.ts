import { config } from "@/config";
import { logger } from "@/logger";
import { CredData } from "@services/skportAuth/contracts/CredData";
import { CredResponse } from "@services/skportAuth/contracts/CredResponse";
import axios, { AxiosResponse } from "axios";

export class SkportAuthenticator {
    private static readonly _skportCredUrl = config.skportCredUrl as string;

    private readonly _gryphAuthCode: string;

    public constructor(gryphAuthCode: string) {
        if (!SkportAuthenticator._skportCredUrl) {
            throw new Error("skportBindingUrl is not provided");
        }

        this._gryphAuthCode = gryphAuthCode;
    }

    public static async authenticate(gryphAuthCode: string): Promise<CredData | null> {
        let authenticator = this.create(gryphAuthCode);

        if (!authenticator) {
            return null;
        }

        return authenticator.getAuthData();
    }

    public static create(gryphAuthCode: string): SkportAuthenticator | null {
        let authenticator: SkportAuthenticator;

        try {
            authenticator = new SkportAuthenticator(gryphAuthCode);
        } catch (e) {
            logger.error(e);

            return null;
        }

        return authenticator;
    }

    private static isCredDataValid(data?: CredData): data is CredData {
        return Boolean(data && data.cred && data.token && data.userId);
    }

    private static getRequestConfig() {
        return {
            headers: {
                "Content-Type": "application/json"
            }
        };
    }

    public async getAuthData(): Promise<CredData | null> {
        let responseData: CredResponse;

        try {
            responseData = await this.getResponseData();
        } catch (error) {
            logger.error(`SkportAuthenticator error: ${this._gryphAuthCode}\n${error}`);

            return null;
        }

        let data = responseData.data;

        if (!SkportAuthenticator.isCredDataValid(data)) {
            logger.warn(`SkportAuthenticator: No data in auth response: ${this._gryphAuthCode}`);

            return null;
        }

        return data;
    }

    private async getResponseData(): Promise<CredResponse> {
        logger.info("SkportAuthenticator: Getting response data");

        let resp: AxiosResponse<CredResponse>;

        try {
            resp = await axios.post(
                SkportAuthenticator._skportCredUrl,
                this.getRequestData(),
                SkportAuthenticator.getRequestConfig()
            );
        } catch (e) {
            throw e;
        }

        logger.info("SkportAuthenticator: Response data received");

        return resp.data;
    }

    private getRequestData() {
        return {
            code: this._gryphAuthCode,
            kind: 1
        };
    }
}