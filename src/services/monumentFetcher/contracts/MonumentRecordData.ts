import { MonumentCharData } from "@services/monumentFetcher/contracts/MonumentCharData.js";

export interface MonumentRecordData {
    ts: string;
    passTs: string;
    chars: MonumentCharData[];
}