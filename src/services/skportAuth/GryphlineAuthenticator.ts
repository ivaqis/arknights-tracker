import { config } from "@/config";
import { AuthData } from "@services/skportAuth/contracts/AuthData";
import { AuthResponse } from "@services/skportAuth/contracts/AuthResponse";
import axios, { AxiosResponse } from "axios";

export class GryphlineAuthenticator {
    private static readonly _gryphlineAuthUrl = config.gryphlineAuthUrl as string;

    private readonly _authToken: string;

    public constructor(authToken: string) {
        if (!GryphlineAuthenticator._gryphlineAuthUrl) {
            throw new Error("gryphlineAuthUrl is not provided");
        }

        this._authToken = authToken;
    }

    public static async authenticate(authToken: string): Promise<AuthData | null> {
        let authenticator: GryphlineAuthenticator;

        try {
            authenticator = new GryphlineAuthenticator(authToken);
        } catch (error) {
            console.error(error);

            return null;
        }

        return authenticator.getAuthData();
    }

    private static getRequestConfig() {
        return {
            headers: {
                "Content-Type": "application/json"
            }
        };
    }

    public async getAuthData(): Promise<AuthData | null> {
        let responseData: AuthResponse;

        try {
            responseData = await this.getResponseData();
        } catch (error) {
            console.error(`[ERROR] GryphlineAuthenticator error: ${this._authToken}`, error);

            return null;
        }

        let data = responseData.data;

        if (!(data && data.uid && data.code)) {
            console.log(`[WARNING] No data in auth response: ${this._authToken}`);

            return null;
        }

        return data;
    }

    private async getResponseData(): Promise<AuthResponse> {
        let resp: AxiosResponse<AuthResponse>;

        try {
            resp = await axios.post(
                GryphlineAuthenticator._gryphlineAuthUrl,
                this.getRequestData(),
                GryphlineAuthenticator.getRequestConfig()
            );
        } catch (error) {
            throw error;
        }

        return resp.data;
    }

    private getRequestData() {
        return {
            token: this._authToken,
            appCode: "6eb76d4e13aa36e6",
            type: 0
        };
    }
}