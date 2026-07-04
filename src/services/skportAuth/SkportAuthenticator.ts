import { config } from "@/config";
import { BadResponseStatusError } from "@errors/BadResponseStatusError";
import { CredData } from "@services/skportAuth/contracts/CredData";
import { CredResponse } from "@services/skportAuth/contracts/CredResponse";
import axios, { AxiosResponse } from "axios";

export class SkportAuthenticator {
    private static readonly _skportBindingUrl = config.skportBindingUrl as string;

    private readonly _gryphAuthCode: string;

    public constructor(gryphAuthCode: string) {
        if (!SkportAuthenticator._skportBindingUrl) {
            throw new Error("skportBindingUrl is not provided");
        }

        this._gryphAuthCode = gryphAuthCode;
    }

    public static async authenticate(gryphAuthCode: string): Promise<CredData | null> {
        let authenticator: SkportAuthenticator;

        try {
            authenticator = new SkportAuthenticator(gryphAuthCode);
        } catch (e) {
            console.error(e);

            return null;
        }

        return authenticator.getAuthData();
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
            console.error(`[ERROR] SkportAuthenticator error: ${this._gryphAuthCode}`, error);

            return null;
        }

        let data = responseData.data;

        if (!SkportAuthenticator.isCredDataValid(data)) {
            console.log(`[WARNING] No data in auth response: ${this._gryphAuthCode}`);

            return null;
        }

        return data;
    }

    private async getResponseData(): Promise<CredResponse> {
        let resp: AxiosResponse<CredResponse>;

        try {
            resp = await axios.post(
                SkportAuthenticator._skportBindingUrl,
                this.getRequestData(),
                SkportAuthenticator.getRequestConfig()
            );
        } catch (e) {
            throw e;
        }

        if (resp.status !== 200) {
            throw new BadResponseStatusError(resp.status, resp);
        }

        return resp.data;
    }

    private getRequestData() {
        return {
            code: this._gryphAuthCode,
            kind: 1
        };
    }
}