import { WarEchoesCharData } from "@services/warEchoesFetcher/contracts/WarEchoesCharData.js";

export interface WarEchoesRecordData {
    ts: string;
    passTs: string;
    chars: WarEchoesCharData[];
}
