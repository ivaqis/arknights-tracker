import { logger } from "@/logger.js";
import { ImageValidator } from "@services/imageValidator/ImageValidator.js";
import { IService } from "@services/IService.js";
import { randomUUID, UUID } from "node:crypto";
import * as fs from "node:fs";
import path from "node:path";
import sharp, { Sharp } from "sharp";

export class AvatarUploader implements IService {
    public static readonly UPLOADS_DIR_PATH = path.resolve(process.cwd(), "uploads");

    public readonly name: string = "AvatarUploader";

    private readonly _imageValidator: ImageValidator;

    public constructor() {
        this._imageValidator = new ImageValidator({
            maxSize: 1024 * 1024,
            minHeight: 128,
            minWidth: 128
        });

        if (!fs.existsSync(AvatarUploader.UPLOADS_DIR_PATH)) {
            fs.mkdirSync(AvatarUploader.UPLOADS_DIR_PATH, { recursive: true });
        }
    }

    private static async getBuffer(image: Sharp): Promise<Buffer> {
        return image
            .rotate()
            .toFormat("webp")
            .toBuffer();
    }

    public get imageValidator(): ImageValidator {
        return this._imageValidator;
    }

    public isActive(): boolean {
        return true;
    }

    public async uploadAvatar(base64Data: string): Promise<UUID | null> {
        const match = ImageValidator.getMatch(base64Data);

        if (!match) {
            throw new Error("Invalid image format.");
        }

        const base64Str = match[2];
        const buffer = Buffer.from(base64Str, "base64");

        const img = sharp(buffer);
        const metadata = await img.metadata();

        const isValid = this._imageValidator.isValid(metadata);

        if (!isValid) {
            logger.info("Invalid image upload attempt");

            return null;
        }

        const processedBuffer = await AvatarUploader.getBuffer(img);

        const imageId = randomUUID();
        const filename = `${imageId}.webp`;
        const filePath = path.resolve(AvatarUploader.UPLOADS_DIR_PATH, filename);

        await fs.promises.writeFile(filePath, processedBuffer);

        return imageId;
    }

    public async deleteAvatar(avatarId: string): Promise<boolean> {
        const avatarPath = path.resolve(AvatarUploader.UPLOADS_DIR_PATH, `${avatarId}.webp`);

        if (!fs.existsSync(avatarPath)) {
            logger.info(`AvatarUploader: ${avatarId} not found`);

            return false;
        }

        try {
            await fs.promises.unlink(avatarPath);

            logger.info(`AvatarUploader: ${avatarId} deleted`);

            return true;
        } catch (e) {
            logger.warn(`AvatarUploader: An error occurred while deleting avatar: ${e}\n${avatarPath}`);

            if (e instanceof Error) {
                logger.warn(e.stack);
            }

            return false;
        }
    }
}