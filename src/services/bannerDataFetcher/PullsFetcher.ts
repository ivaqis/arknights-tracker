import { logger } from "@/logger";
import { BannerRequestParams } from "@models/urlParams/banners/BannerRequestParams";
import { BannerResponse } from "@services/bannerDataFetcher/contracts/BannerResponse";
import { PullEntity } from "@services/bannerDataFetcher/entities/PullEntity";
import { sleep } from "@utils/globalUtils";
import axios, { AxiosRequestConfig, AxiosResponse } from "axios";

export class PullsFetcher<T extends PullEntity, U extends BannerRequestParams> {
    public static readonly INVALID_TOKEN_CODE = 40100;
    public static readonly PAGE_COUNT_LIMIT = 2000;
    public static readonly LAST_PULL_TIME_CUTOFF = 7200000n;

    private readonly _url: string;
    private readonly _urlParams: U;
    private readonly _lastPullTimeMs: bigint;

    constructor(url: string, urlParams: U, lastPullTimeMs: bigint = 0n) {
        this._url = url;
        this._urlParams = urlParams;

        this._lastPullTimeMs = lastPullTimeMs;
    }

    private get safeLastPullTimeMs() {
        return Math.max(0, Number(this._lastPullTimeMs - PullsFetcher.LAST_PULL_TIME_CUTOFF));
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

    public async getPullsList() {
        const list: T[] = [];
        let errorMsg: string | null = null;

        let hasMore = true;
        let pageCount = 0;

        while (hasMore && pageCount < PullsFetcher.PAGE_COUNT_LIMIT) {
            pageCount++;

            let url = this.getFullUrl();
            let resp: BannerResponse<T>;

            try {
                resp = await this.getResponseData(url);
            } catch (e) {
                hasMore = false;
                logger.error(`Error while fetching pulls: ${e}`);

                if (e instanceof Error) {
                    errorMsg = e.message;
                }

                break;
            }

            let resolvedData = this.resolveResponseData(resp);

            if (resolvedData.errorMsg) {
                hasMore = false;
                errorMsg = resolvedData.errorMsg;
                break;
            }

            hasMore = resolvedData.hasMore;
            this._urlParams.seqId = list[list.length - 1].seqId;
            let isEnded = this.addPullsToList(list, resolvedData.list);

            if (isEnded) {
                hasMore = false;
                logger.info("[Optimization] Reached known history")
                break;
            }

            await sleep(50);
        }

        return {
            list: list,
            error: errorMsg
        };
    }

    private addPullsToList(list: T[], newPulls: T[]): boolean {
        if (newPulls.length === 0) {
            return true;
        }

        for (let pull of newPulls) {

            if (Number(pull.gachaTs) < this.safeLastPullTimeMs) {
                return true;
            }

            list.push(pull);
        }

        return false;
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
        logger.info(`PullsFetcher: Getting response data: ${this._urlParams.seqId}`);

        let resp: AxiosResponse<BannerResponse<T>>;

        try {
            resp = await axios.get(url, PullsFetcher.getDefaultRequestConfig());
        } catch (e) {
            throw e;
        }

        logger.info("PullsFetcher: Response data received");

        return resp.data;
    }
}