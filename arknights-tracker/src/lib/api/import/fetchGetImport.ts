import type { GetImportGenericResponse } from "$lib/api/import/contracts/GetImportGenericResponse";
import { parseStream } from "$lib/api/parseStream";
import { config } from "$lib/config";

export async function fetchGetImport(token: string, serverIds: string[], lastPulls: Record<string, number> | bigint | number = 0): Promise<AsyncGenerator<GetImportGenericResponse, void, unknown>> {
    const encodedToken = encodeURIComponent(token);
    const encodedServerIds = encodeURIComponent(serverIds.join(","));
    let queryParam = "";
    if (typeof lastPulls === "object" && lastPulls !== null) {
        queryParam = `&lastPulls=${encodeURIComponent(JSON.stringify(lastPulls))}`;
    } else {
        queryParam = `&lastPullTs=${lastPulls}`;
    }
    const url = `${config.API_BASE}/api/v2/import?token=${encodedToken}&serverIds=${encodedServerIds}${queryParam}`;

    console.log(url);

    const response = await fetch(url, {
        method: "GET",
        headers: {
            "Accept": "text/event-stream"
        }
    });

    if (response.status === 429) {
        throw new Error("RATE_LIMIT");
    }

    if (response.status >= 500) {
        throw new Error("NETWORK_ERROR");
    }

    if (!response.ok) {
        throw new Error(`HTTP Error ${response.status}`);
    }

    return parseStream<GetImportGenericResponse>(response);
}