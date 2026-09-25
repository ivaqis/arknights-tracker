import type { GetProfileIdResponse } from "$lib/api/getProfileId/contracts/GetProfileIdResponse";
import type { ResponseBody } from "$lib/api/ResponseBody";
import { config } from "$lib/config";

export async function fetchGetProfileId(privateId: string): Promise<GetProfileIdResponse | null> {
    const url = `${config.API_BASE}/api/v2/import/profile-id?privateId=${privateId}`;

    try {
        const res = await fetch(url, {
            method: "GET",
        });
        const json = await res.json() as ResponseBody<GetProfileIdResponse>;

        if (!res.ok) {
            throw new Error(`Failed to fetch profile id: ${res.status} ${res.statusText}\nmessage: ${json.message}\nurl: ${url}`);
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