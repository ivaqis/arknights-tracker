import { config } from "@/config";
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

    private static isGameDataListValid(list: GameData[]): boolean {
        if (!list) {
            return false;
        }

        for (const item of list) {
            if (!(item.appCode && item.appName && item.bindingList)) {
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
            console.error(error);

            return null;
        }

        let list = responseData.data.list;

        if (!SkportBindingFetcher.isGameDataListValid(list)) {
            return null;
        }

        return list;
    }

    public async getEndfieldGameData(): Promise<GameData | null> {
        let list = await this.getGameDataList()

        if (!list) {
            return null;
        }

        for (const item of list) {
            if (item.appCode === "endfield") {
                return item;
            }
        }

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

        return list;
    }

    private async getResponseData(): Promise<BindingResponse> {
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