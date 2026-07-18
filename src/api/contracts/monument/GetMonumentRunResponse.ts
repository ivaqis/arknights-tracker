import { MonumentRecordEntity } from "@models/monument/entities/MonumentRecordEntity";

export interface GetMonumentRunResponse {
    uid: string;
    avatarId: string | null;
    level: number;
    serverId: string;
    recordData: MonumentRecordEntity;
}