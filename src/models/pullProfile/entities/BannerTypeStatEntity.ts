import { ExcludeRange } from "@models/ExcludeRange";

export interface BannerTypeStatEntity {
    totalPulls: {
        count: number;
        rating: ExcludeRange;
    };
    luck6: {
        avg: number;
        rating: ExcludeRange;
    } | null;
    luck5: {
        avg: number;
        rating: ExcludeRange;
    } | null;
}