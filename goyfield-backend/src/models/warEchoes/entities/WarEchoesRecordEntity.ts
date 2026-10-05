import { WarEchoesCharacterEntity } from "@models/warEchoes/entities/WarEchoesCharacterEntity.js";

export interface WarEchoesRecordEntity {
    dungeonId: string;
    groupId: string;
    difficulty: string;
    ts: string;
    passTs: number;
    chars: WarEchoesCharacterEntity[];
}
