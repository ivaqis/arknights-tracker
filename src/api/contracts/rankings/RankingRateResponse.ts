import { ExcludeRange } from "@models/ExcludeRange";

export interface RankingRateResponse {
    totalPullsRate: ExcludeRange;
    win5050Rate: ExcludeRange | null;
    luck6Rate: ExcludeRange | null;
    luck5Rate: ExcludeRange | null;
}