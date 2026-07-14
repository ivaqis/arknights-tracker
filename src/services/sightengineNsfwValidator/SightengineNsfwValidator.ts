import { logger } from "@/logger";
import { ImageValidator } from "@services/imageValidator/ImageValidator";
import { IService } from "@services/IService";
import { SightengineResponse } from "@services/sightengineNsfwValidator/contracts/SightengineResponse";
import { NsfwCheckResult } from "@services/sightengineNsfwValidator/NsfwCheckResult";
import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { Blob } from "node:buffer";

export class SightengineNsfwValidator implements IService {
    private static readonly SIGHTENGINE_URL = "https://api.sightengine.com/1.0/check.json";
    private static readonly SEXUAL_ACTIVITY_LIMIT = 0.5;
    private static readonly SEXUAL_DISPLAY_LIMIT = 0.5;
    private static readonly EROTICA_LIMIT = 0.5;

    public readonly name = "SightengineNsfwValidator";

    private readonly _sightengineUser;
    private readonly _sightengineSecret;

    public constructor(sightengineUser: string, sightengineSecret: string) {
        this._sightengineUser = sightengineUser;
        this._sightengineSecret = sightengineSecret;
    }

    private static getConfig(): AxiosRequestConfig {
        return {
            timeout: 5000
        };
    }

    private static getBlob(base64Image: string): Blob {
        const match = base64Image.match(ImageValidator.IMAGE_HEADER_MATCH);
        const base64Str = match ? match[2] : base64Image;
        const buffer = Buffer.from(base64Str, "base64");

        return new Blob([buffer], { type: "image/webp" });
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

        const nudity = response.nudity;
        const isNsfw = nudity.sexual_activity >= SightengineNsfwValidator.SEXUAL_ACTIVITY_LIMIT
            || nudity.sexual_display >= SightengineNsfwValidator.SEXUAL_DISPLAY_LIMIT
            || nudity.erotica >= SightengineNsfwValidator.EROTICA_LIMIT;

        return {
            success: true,
            isNsfw: isNsfw
        };
    }

    public isActive(): boolean {
        return !!(this._sightengineSecret && this._sightengineUser);
    }

    private getFormData(base64Image: string, filename: string = "image.webp"): FormData {
        const formData = new FormData();

        const blob = SightengineNsfwValidator.getBlob(base64Image);

        formData.append("media", blob, filename);
        formData.append("models", "nudity-2.0");
        formData.append("api_user", this._sightengineUser);
        formData.append("api_secret", this._sightengineSecret);

        return formData;
    }

    private async getResponseData(form: FormData): Promise<SightengineResponse | null> {
        let resp: AxiosResponse<SightengineResponse>;

        try {
            resp = await axios.post(
                SightengineNsfwValidator.SIGHTENGINE_URL,
                form,
                SightengineNsfwValidator.getConfig()
            );
        } catch (e) {
            logger.warn(`SightengineValidator: Sightengine API check failed, falling back: ${e}`);

            if (e instanceof Error) {
                logger.warn(e.stack);
            }

            return null;
        }

        const data = resp.data;

        if (!data || data.status !== "success") {
            logger.warn(`SightengineValidator: Invalid response data: ${JSON.stringify(data, null, 2)}`);

            return null;
        }

        return data;
    }
}