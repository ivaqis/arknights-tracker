import { IService } from "@services/IService.js";
import { NsfwCheckResult } from "@services/sightengineNsfwValidator/NsfwCheckResult.js";

export interface INsfwValidator extends IService {
    isNsfwImage(base64Image: string, filename?: string): Promise<NsfwCheckResult>;
}
