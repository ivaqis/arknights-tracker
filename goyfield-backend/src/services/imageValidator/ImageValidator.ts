import { ImageValidatorParams } from "@services/imageValidator/ImageValidatorParams.js";
import { Metadata } from "sharp";

export class ImageValidator {
    public static readonly IMAGE_HEADER_MATCH = /^data:image\/(jpeg|jpg|png|webp|avif);base64,(.+)$/i;

    private readonly _params: ImageValidatorParams;

    public constructor(params: ImageValidatorParams) {
        this._params = params;
    }

    public static isValid(data: Metadata, params: ImageValidatorParams): boolean {
        const imageValidator = new ImageValidator(params);

        return imageValidator.isValid(data);
    }

    public static getMatch(base64Data: string): RegExpMatchArray | null {
        return base64Data.match(this.IMAGE_HEADER_MATCH);
    }

    public isValid(data: Metadata): boolean {
        const size = data.size;
        const width = data.width;
        const height = data.height;

        return this.isValidSize(size)
            && this.isValidWidth(width)
            && this.isValidHeight(height);
    }

    private isValidSize(size?: number): boolean {
        if (size === undefined || this._params.maxSize === undefined) {
            return true;
        }

        return size <= this._params.maxSize;
    }

    private isValidHeight(height: number): boolean {
        return (this._params.minHeight === undefined || height >= this._params.minHeight)
            && (this._params.maxHeight === undefined || height <= this._params.maxHeight);
    }

    private isValidWidth(width: number): boolean {
        return (this._params.minWidth === undefined || width >= this._params.minWidth)
            && (this._params.maxWidth === undefined || width <= this._params.maxWidth);
    }
}