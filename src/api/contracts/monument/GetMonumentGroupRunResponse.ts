import { MonumentRecordEntity } from "@models/monument/entities/MonumentRecordEntity";

export interface GetMonumentGroupRunResponse {
    uid: string;
    avatarId: string | null;
    level: number;
    serverId: string;
    recordsData: MonumentRecordEntity[];
}