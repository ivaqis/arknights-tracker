import { logger } from "@/logger.js";
import { INsfwValidator } from "@services/nsfwValidator/INsfwValidator.js";
import { NsfwCheckResult } from "@services/sightengineNsfwValidator/NsfwCheckResult.js";

export class CompositeNsfwValidator implements INsfwValidator {
    public readonly name = "CompositeNsfwValidator";

    private readonly _validators: INsfwValidator[];

    public constructor(validators: INsfwValidator[]) {
        this._validators = validators;
    }

    public async isNsfwImage(base64Image: string, filename?: string): Promise<NsfwCheckResult> {
        const normalizedFilename = filename?.toLowerCase();
        if (normalizedFilename && normalizedFilename.includes("nsfw")) {
            return {
                success: true,
                isNsfw: true
            };
        }

        const activeValidators = this._validators.filter(v => v.isActive());

        if (activeValidators.length === 0) {
            logger.warn("CompositeNsfwValidator: No active NSFW validators available");

            return {
                success: true,
                isNsfw: false
            };
        }

        let atLeastOneSuccess = false;

        for (const validator of activeValidators) {
            try {
                const result = await validator.isNsfwImage(base64Image, filename);

                if (result.success) {
                    atLeastOneSuccess = true;
                }

                if (result.isNsfw) {
                    logger.info(`CompositeNsfwValidator: Flagged as NSFW by ${validator.name}`);

                    return {
                        success: true,
                        isNsfw: true
                    };
                }
            } catch (e) {
                logger.warn(`CompositeNsfwValidator: ${validator.name} check failed: ${e}`);
            }
        }

        return {
            success: atLeastOneSuccess,
            isNsfw: false
        };
    }

    public isActive(): boolean {
        return this._validators.some(v => v.isActive());
    }
}
