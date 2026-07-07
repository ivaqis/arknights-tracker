import { MonumentCharacterEntity } from "@models/monument/entities/MonumentCharacterEntity";

export interface MonumentRecordEntity {
    dungeonId: string;
    groupId: string;
    isHard: boolean;
    ts: string;
    passTs: number;
    chars: MonumentCharacterEntity[];
}