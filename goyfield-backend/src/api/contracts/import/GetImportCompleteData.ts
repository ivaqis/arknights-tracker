import { BannersPullsEntity } from "@models/pulls/entities/BannersPullsEntity.js";

export interface GetImportCompleteData {
    serverId: string;
    pulls: BannersPullsEntity;
}