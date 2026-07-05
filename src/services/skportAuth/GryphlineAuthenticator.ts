import { config } from "@/config";
import { logger } from "@/logger";
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
        let authenticator = this.create(authToken);

        if (!authenticator) {
            return null;
        }

        return authenticator.getAuthData();
    }

    public static create(authToken: string): GryphlineAuthenticator | null {
        let authenticator: GryphlineAuthenticator;

        try {
            authenticator = new GryphlineAuthenticator(authToken);
        } catch (error) {
            logger.error(error);

            return null;
        }

        return authenticator;
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
            logger.error(`GryphlineAuthenticator error: ${this._authToken}\n${error}`);

            return null;
        }

        let data = responseData.data;

        if (!(data && data.uid && data.code)) {
            logger.warn(`GryphlineAuthenticator: No data in auth response: ${this._authToken}`);

            return null;
        }

        return data;
    }

    private async getResponseData(): Promise<AuthResponse> {
        logger.info("GryphlineAuthenticator: Getting response data");

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

        logger.info("GryphlineAuthenticator: Response data received");

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