import { BannersPullsEntity } from "@models/pulls/entities/BannersPullsEntity";

export interface GetImportCompleteResponse {
    serverId: string;
    pulls: BannersPullsEntity;
}