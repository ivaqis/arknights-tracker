import type { ImageVariant } from "$lib/classes/icons/ImageVariant";

export interface IImageIcon {
    readonly iconId: string;
    readonly imageVariant: ImageVariant;
}