import type { BannersPullsData } from "$lib/api/import/contracts/pulls/BannersPullsData";

export interface GetImportCompleteData {
    serverId: string;
    pulls: BannersPullsData;
}