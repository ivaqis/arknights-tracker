import { config } from "@/config";
import { logger } from "@/logger";
import { CredData } from "@services/skportAuth/contracts/CredData";
import { BindingResponse } from "@services/skportBindingFetcher/contracts/BindingResponse";
import { GameData } from "@services/skportBindingFetcher/contracts/GameData";
import { RoleData } from "@services/skportBindingFetcher/contracts/RoleData";
import { generateSign } from "@utils/skportUtils";
import axios, { AxiosResponse } from "axios";

export class SkportBindingFetcher {
    private static readonly _skportBindingUrl = config.skportBindingUrl as string;
    private static readonly _skportBindingPath = config.skportBindingPath as string;

    private readonly _cred: string;
    private readonly _token: string;

    private _timestamp: string = "0";

    public constructor(credData: CredData) {
        if (!SkportBindingFetcher._skportBindingUrl) {
            throw new Error("skportBindingUrl is not provided");
        }

        this._cred = credData.cred;
        this._token = credData.token;
    }

    public static async getGameDataList(credData: CredData): Promise<GameData[] | null> {
        const fetcher = this.create(credData);

        if (!fetcher) {
            return null;
        }

        return fetcher.getGameDataList();
    }

    public static async getEndfieldGameData(credData: CredData): Promise<GameData | null> {
        const fetcher = this.create(credData);

        if (!fetcher) {
            return null;
        }

        return fetcher.getEndfieldGameData();
    }

    public static async getEndfieldRoles(credData: CredData): Promise<RoleData[] | null> {
        const fetcher = this.create(credData);

        if (!fetcher) {
            return null;
        }

        return fetcher.getEndfieldRoles();
    }

    public static create(credData: CredData): SkportBindingFetcher | null {
        let fetcher: SkportBindingFetcher;

        try {
            fetcher = new SkportBindingFetcher(credData);
        } catch (error) {
            logger.error(error);

            return null;
        }

        return fetcher;
    }

    private static isGameDataListValid(list: GameData[]): boolean {
        if (!list) {
            logger.warn("SkportBindingFetcher: gameData list is empty");

            return false;
        }

        for (const item of list) {
            if (!(item.appCode && item.appName && item.bindingList)) {
                logger.warn("SkportBindingFetcher: gameData list is not valid");

                return false;
            }
        }

        return true;
    }

    public async getGameDataList(): Promise<GameData[] | null> {
        let responseData: BindingResponse;

        try {
            responseData = await this.getResponseData();
        } catch (error) {
            logger.error(error);

            return null;
        }

        let list = responseData.data.list;

        if (!SkportBindingFetcher.isGameDataListValid(list)) {
            return null;
        }

        return list;
    }

    public async getEndfieldGameData(): Promise<GameData | null> {
        let list = await this.getGameDataList();

        if (!list) {
            return null;
        }

        for (const item of list) {
            if (item.appCode === "endfield") {
                logger.info("SkportBindingFetcher: Endfield game data found");

                return item;
            }
        }

        logger.info("SkportBindingFetcher: No Endfield game data");

        return null;
    }

    public async getEndfieldRoles(): Promise<RoleData[] | null> {
        const gameData = await this.getEndfieldGameData();
        const list: RoleData[] = [];

        if (!gameData) {
            return null;
        }

        const accountDataList = gameData.bindingList;
        for (const item of accountDataList) {
            for (const role of item.roles) {
                list.push(role);
            }
        }

        if (list.length === 0) {
            logger.warn("SkportBindingFetcher: No roles found");
        }

        return list;
    }

    private async getResponseData(): Promise<BindingResponse> {
        logger.info("SkportBindingFetcher: Getting response data");

        let resp: AxiosResponse<BindingResponse>;

        this.initTimestamp();

        try {
            resp = await axios.get(
                SkportBindingFetcher._skportBindingUrl,
                this.getRequestConfig()
            );
        } catch (e) {
            throw e;
        }

        logger.info("SkportBindingFetcher: Response data received");

        return resp.data;
    }

    private getRequestConfig() {
        return {
            headers: {
                "Accept": "application/json",
                "cred": this._cred,
                "sign": this.getSign(),
                "platform": "3",
                "timestamp": this._timestamp,
                "vname": "1.0.0",
                "dId": "",
                "sk-language": "en_US",
                "User-Agent": "Mozilla/5.0"
            }
        };
    }

    private getSign(): string {
        return generateSign(
            SkportBindingFetcher._skportBindingPath,
            "",
            this._timestamp,
            this._token
        );
    }

    private initTimestamp() {
        this._timestamp = String(Math.floor(Date.now() / 1000));
    }
}