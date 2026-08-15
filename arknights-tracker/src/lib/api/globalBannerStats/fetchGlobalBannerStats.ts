import type { GlobalBannerStatsResponse } from "$lib/api/globalBannerStats/contracts/GlobalBannerStatsResponse";
import type { ResponseBody } from "$lib/api/ResponseBody";
import { config } from "$lib/config";

export async function fetchGlobalBannerStats(bannerId: string): Promise<GlobalBannerStatsResponse | null> {
    const url = `${config.API_BASE}/v2/global/stats?bannerId=${bannerId}`;

    try {
        const res = await fetch(url);
        const json = await res.json() as ResponseBody<GlobalBannerStatsResponse>;

        if (!res.ok) {
            throw new Error(`Global stats fetching failed: ${res.status} ${res.statusText}\nmessage: ${json.message}`);
        }

        if (json.data) {
            return json.data;
        }

        return null;
    } catch (error) {
        console.error(error);

        return null;
    }
}