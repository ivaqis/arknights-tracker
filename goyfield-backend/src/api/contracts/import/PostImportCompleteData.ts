import { BannersPullsEntity } from "@models/pulls/entities/BannersPullsEntity.js";

export interface PostImportCompleteData {
    profileId: string | null;
    token: string;
    serverId: string;
    pulls: BannersPullsEntity
}