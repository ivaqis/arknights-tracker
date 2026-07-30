import { BannersPullsEntity } from "@models/pulls/entities/BannersPullsEntity";

export interface PostImportCompleteResponse {
    profileId: string | null;
    token: string;
    serverId: string;
    pulls: BannersPullsEntity
}