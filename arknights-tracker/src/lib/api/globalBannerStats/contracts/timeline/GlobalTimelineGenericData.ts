import type { GlobalTimelineData } from "$lib/api/globalBannerStats/contracts/timeline/GlobalTimelineData";
import type { GlobalTimelineFreeData } from "$lib/api/globalBannerStats/contracts/timeline/GlobalTimelineFreeData";

export type GlobalTimelineGenericData =
    & GlobalTimelineData
    & Partial<GlobalTimelineFreeData>;