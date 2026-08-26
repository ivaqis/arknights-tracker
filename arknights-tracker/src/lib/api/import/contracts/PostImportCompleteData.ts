import type { BannersPullsData } from "$lib/api/import/contracts/pulls/BannersPullsData";

export interface PostImportCompleteData {
    profileId: string | null;
    token: string;
    serverId: string;
    pulls: BannersPullsData;
}