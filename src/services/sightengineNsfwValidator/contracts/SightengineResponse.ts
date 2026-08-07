import { NudityData } from "@services/sightengineNsfwValidator/contracts/NudityData.js";
import { RequestData } from "@services/sightengineNsfwValidator/contracts/RequestData.js";

/**
 * Response for nudity 2.0
 *
 * https://sightengine.com/docs/advanced-nudity-detection-model#use-model
 */
export interface SightengineResponse {
    status: "success" | string;
    request: RequestData;
    nudity: NudityData;
}

