import { BannersPullsEntity } from "@models/pulls/entities/BannersPullsEntity.js";

export interface GetImportCompleteResponse {
    serverId: string;
    pulls: BannersPullsEntity;
}