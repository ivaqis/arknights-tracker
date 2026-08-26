import type { ResponseBody } from "$lib/api/ResponseBody";
import type { SyncPullsResponse } from "$lib/api/syncPulls/contracts/SyncPullsResponse";
import { config } from "$lib/config";

export async function fetchSyncPulls(token: string, confirm: boolean): Promise<SyncPullsResponse> {
    const url = `${config.API_BASE}/api/v2/import/sync?token=${token}`;

    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ confirm: confirm }),
    });

    const body = await response.json() as ResponseBody<SyncPullsResponse>;

    if (!response.ok || !body.data) {
        console.error(body.message);

        throw new Error(`Sync pulls failed with status ${response.status}\nmessage: '${body.message}'`);
    }

    return body.data;
}