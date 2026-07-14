import { NudityData } from "@services/sightengineNsfwValidator/contracts/NudityData";
import { RequestData } from "@services/sightengineNsfwValidator/contracts/RequestData";

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

