import { logger } from "@/logger";
import { BannerType } from "@models/banners/BannerType";
import { BannerRequestParams } from "@models/urlParams/banners/BannerRequestParams";
import { CharBannerRequestParams } from "@models/urlParams/banners/CharBannerRequestParams";
import { BannerResponse } from "@services/bannerDataFetcher/contracts/BannerResponse";
import { PullData } from "@services/bannerDataFetcher/entities/PullData";
import { sleep } from "@utils/asyncUtils";
import axios, { AxiosRequestConfig, AxiosResponse } from "axios";

export class PullsFetcher<T extends PullData, U extends BannerRequestParams> {
    public static readonly INVALID_TOKEN_CODE = 40100;
    public static readonly PAGE_COUNT_LIMIT = 2000;
    public static readonly LAST_PULL_TIME_CUTOFF = 7200000; // 2 hours

    private readonly _pullsList: T[] = [];

    private readonly _url: string;
    private readonly _urlParams: U;
    private readonly _callbackFn?: (count: number) => void;
    private _lastProcessedPullTs: number = 0;
    private _hasMore: boolean = true;
    private _pageCount: number = 0;

    constructor(url: string, urlParams: U, callbackFn?: (count: number) => void) {
        this._url = url;
        this._urlParams = urlParams;

        this._callbackFn = callbackFn;
    }

    private static getSafeLastPullTimeMs(lastPullTimeMs: number): number {
        return Math.max(lastPullTimeMs - this.LAST_PULL_TIME_CUTOFF, 0);
    }

    private _error: string | null = null;

    public get error(): string | null {
        return this._error;
    }

    public get pullsList(): T[] {
        return this._pullsList;
    }

    private static getDefaultRequestConfig(): AxiosRequestConfig {
        return {
            timeout: 5000,
            headers: {
                "Accept": "application/json",
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            }
        };
    }

    public async test(): Promise<boolean> {
        let url = this.getFullUrl();
        let resp: BannerResponse<T>;

        try {
            resp = await this.getResponseData(url);
        } catch (e) {
            logger.error(`Error while fetching pulls: ${e}`);

            if (e instanceof Error) {
                logger.error(e.stack);
            }

            return false;
        }

        const code = resp.code;

        if (code === 0) {
            logger.debug(`Token approved ${this._urlParams.serverId} ${this._urlParams.token}`);

            return true;
        }

        logger.debug(`Token test failed ${this._urlParams.serverId} ${this._urlParams.token}`);

        return false;
    }

    public async fetch(lastPullTimeMs: number = 0): Promise<void> {
        if (PullsFetcher.getSafeLastPullTimeMs(lastPullTimeMs) > this._lastProcessedPullTs) {
            return;
        }

        for await (const page of this.getPageStream()) {
            this._pullsList.push(...page);

            this._callbackFn?.(this._pullsList.length);

            logger.debug(this._hasMore);

            if (PullsFetcher.getSafeLastPullTimeMs(lastPullTimeMs) > this._lastProcessedPullTs) {
                return;
            }

            await sleep(50);
        }
    }

    private async* getPageStream(): AsyncGenerator<T[], void, unknown> {
        while (this._hasMore && this._pageCount < PullsFetcher.PAGE_COUNT_LIMIT) {
            this._pageCount++;

            let url = this.getFullUrl();
            let resp: BannerResponse<T>;

            try {
                resp = await this.getResponseData(url);
            } catch (e) {
                this._hasMore = false;
                logger.error(`Error while fetching pulls: ${e}`);

                if (e instanceof Error) {
                    logger.error(e.stack);
                    this._error = e.message;
                }

                break;
            }

            let resolvedData = this.resolveResponseData(resp);

            if (resolvedData.errorMsg) {
                this._hasMore = false;
                this._error = resolvedData.errorMsg;
                break;
            }

            this._hasMore = resolvedData.hasMore;

            let temp = resolvedData.list.at(-1);
            if (temp) {
                this._urlParams.seqId = temp.seqId;
                this._lastProcessedPullTs = Number(temp.gachaTs);
            } else {
                this._hasMore = false;
            }

            yield resolvedData.list;
        }
    }

    private resolveResponseData(resp: BannerResponse<T>) {
        let errorMsg: string | undefined;
        let list: T[] | undefined;
        let hasMore: boolean = false;

        if (resp.code === 0) {
            list = resp.data.list;
            hasMore = resp.data.hasMore;
        } else {
            if (resp.code === PullsFetcher.INVALID_TOKEN_CODE) {
                errorMsg = `Error code ${resp.code}: Invalid token`;
            } else {
                errorMsg = `Invalid response data code: ${resp.code}`;
            }
        }

        return {
            errorMsg,
            list: list ?? [],
            hasMore
        };
    }

    private getFullUrl(): string {
        return `${this._url}?${this.getParamString()}`;
    }

    private getParamString(): string {
        return this._urlParams.getParamString();
    }

    private async getResponseData(url: string) {
        logger.info(`PullsFetcher: Getting response data: ${this._urlParams.seqId} ${this.getBannerType()}`);

        let resp: AxiosResponse<BannerResponse<T>>;

        try {
            resp = await axios.get(url, PullsFetcher.getDefaultRequestConfig());
        } catch (e) {
            throw e;
        }

        logger.info("PullsFetcher: Response data received");

        return resp.data;
    }

    private getBannerType(): string {
        if (this._urlParams instanceof CharBannerRequestParams) {
            return this._urlParams.poolType;
        }

        return BannerType.WEAPON;
    }
}