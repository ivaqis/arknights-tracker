import { BannersPullsEntity } from "@models/pulls/entities/BannersPullsEntity";

export interface ImportCompleteResponse {
    token: string | null;
    pulls: BannersPullsEntity;
}