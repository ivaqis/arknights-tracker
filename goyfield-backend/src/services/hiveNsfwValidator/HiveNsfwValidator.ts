import { logger } from "@/logger.js";
import { HiveResponse } from "@services/hiveNsfwValidator/contracts/HiveResponse.js";
import { ImageValidator } from "@services/imageValidator/ImageValidator.js";
import { INsfwValidator } from "@services/nsfwValidator/INsfwValidator.js";
import { NsfwCheckResult } from "@services/sightengineNsfwValidator/NsfwCheckResult.js";
import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { Blob } from "node:buffer";

export class HiveNsfwValidator implements INsfwValidator {
    private static readonly HIVE_URL = "https://api.thehive.ai/api/v3/hive/visual-moderation";
    private static readonly SCORE_LIMIT = 0.2;
    private static readonly NSFW_CLASSES = new Set([
        "general_nsfw",
        "nsfw",
        "yes_sexual_activity",
        "yes_realistic_nsfw",
        "yes_sexual_intent",
        "yes_nudity",
        "yes_female_nudity",
        "yes_male_nudity",
        "yes_genitals",
        "yes_breast",
        "yes_butt",
        "yes_undressed",
        "yes_panties",
        "yes_negligee",
        "yes_sex_toy"
    ]);

    public readonly name = "HiveNsfwValidator";

    private readonly _apiKey: string;

    public constructor(apiKey: string) {
        this._apiKey = apiKey;
    }

    private static getConfig(apiKey: string): AxiosRequestConfig {
        return {
            timeout: 5000,
            headers: {
                "authorization": `Bearer ${apiKey}`
            }
        };
    }

    private static getBlobInfo(base64Image: string): { blob: Blob, filename: string } {
        const match = ImageValidator.getMatch(base64Image);
        const format = match ? match[1].toLowerCase() : "webp";
        const base64Str = match ? match[2] : base64Image;
        const buffer = Buffer.from(base64Str, "base64");
        const mimeType = format === "jpg" ? "image/jpeg" : `image/${format}`;
        const ext = format === "jpeg" ? "jpg" : format;

        return {
            blob: new Blob([buffer], { type: mimeType }),
            filename: `image.${ext}`
        };
    }

    private getFormData(base64Image: string, filename?: string): FormData {
        const formData = new FormData();
        const info = HiveNsfwValidator.getBlobInfo(base64Image);

        formData.append("media", info.blob, filename || info.filename);

        return formData;
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

        const form = this.getFormData(base64Image, filename);
        const response = await this.getResponseData(form);

        if (!response) {
            return {
                success: false,
                isNsfw: false
            };
        }

        const classes = response.output?.[0]?.classes
            || response.status?.[0]?.response?.output?.[0]?.classes
            || [];

        const isNsfw = classes.some(c => {
            const score = c.value ?? c.score ?? 0;

            return HiveNsfwValidator.NSFW_CLASSES.has(c.class) && score >= HiveNsfwValidator.SCORE_LIMIT;
        });

        return {
            success: true,
            isNsfw: isNsfw
        };
    }

    public isActive(): boolean {
        return !!this._apiKey;
    }

    private async getResponseData(form: FormData): Promise<HiveResponse | null> {
        let resp: AxiosResponse<HiveResponse>;

        try {
            resp = await axios.post(
                HiveNsfwValidator.HIVE_URL,
                form,
                HiveNsfwValidator.getConfig(this._apiKey)
            );
        } catch (e) {
            logger.warn(`HiveValidator: API check failed, falling back: ${e}`);

            if (e instanceof Error) {
                logger.warn(e.stack);
            }

            return null;
        }

        return resp.data;
    }
}
