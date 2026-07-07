import { MonumentCharData } from "@services/monumentFetcher/contracts/MonumentCharData";

export interface MonumentRecordData {
    ts: string;
    passTs: string;
    chars: MonumentCharData[];
}