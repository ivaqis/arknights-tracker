import { logger } from "@/logger.js";
import { ImageValidator } from "@services/imageValidator/ImageValidator.js";
import { ModerateContentResponse } from "@services/moderateContentNsfwValidator/contracts/ModerateContentResponse.js";
import { INsfwValidator } from "@services/nsfwValidator/INsfwValidator.js";
import { NsfwCheckResult } from "@services/sightengineNsfwValidator/NsfwCheckResult.js";
import axios, { AxiosRequestConfig, AxiosResponse } from "axios";

export class ModerateContentNsfwValidator implements INsfwValidator {
    private static readonly MODERATE_CONTENT_URL = "https://api.moderatecontent.com/moderate/";
    private static readonly ADULT_LIMIT = 0.2;

    public readonly name = "ModerateContentNsfwValidator";

    private readonly _apiKey: string;

    public constructor(apiKey: string) {
        this._apiKey = apiKey;
    }

    private static getConfig(): AxiosRequestConfig {
        return {
            timeout: 5000,
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            }
        };
    }

    private static getCleanBase64(base64Image: string): string {
        const match = ImageValidator.getMatch(base64Image);
        return match ? match[2] : base64Image;
    }

    public async isNsfwImage(base64Image: string, filename?: string): Promise<NsfwCheckResult> {
        if (!this.isActive()) {
            throw new Error("Service inactive");
        }

        const normalizedFilename = filename?.toLowerCase();
        if (normalizedFilename && normalizedFilename.includes("nsfw")) {
            return {
                success: true,
                isNsfw: true
            };
        }

        const cleanBase64 = ModerateContentNsfwValidator.getCleanBase64(base64Image);
        const params = new URLSearchParams();
        params.append("key", this._apiKey);
        params.append("base64", cleanBase64);

        const response = await this.getResponseData(params);

        if (!response || response.error_code !== 0) {
            return {
                success: false,
                isNsfw: false
            };
        }

        const isNsfw = response.rating_letter === "a"
            || response.rating_label === "adult"
            || response.rating_index === 3
            || (response.predictions?.adult !== undefined && response.predictions.adult >= ModerateContentNsfwValidator.ADULT_LIMIT);

        return {
            success: true,
            isNsfw: isNsfw
        };
    }

    public isActive(): boolean {
        return !!this._apiKey;
    }

    private async getResponseData(params: URLSearchParams): Promise<ModerateContentResponse | null> {
        let resp: AxiosResponse<ModerateContentResponse>;

        try {
            resp = await axios.post(
                ModerateContentNsfwValidator.MODERATE_CONTENT_URL,
                params.toString(),
                ModerateContentNsfwValidator.getConfig()
            );
        } catch (e) {
            logger.warn(`ModerateContentValidator: API check failed, falling back: ${e}`);

            if (e instanceof Error) {
                logger.warn(e.stack);
            }

            return null;
        }

        return resp.data;
    }
}
