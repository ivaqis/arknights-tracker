import type { PostImportGenericResponse } from "$lib/api/import/contracts/PostImportGenericResponse";
import { parseStream } from "$lib/api/parseStream";
import { config } from "$lib/config";

export async function fetchPostImport(token: string, serverIds: string[], privateId: string | null): Promise<AsyncGenerator<PostImportGenericResponse, void, unknown>> {
    const encodedToken = encodeURIComponent(token);
    const encodedServerIds = encodeURIComponent(serverIds.join(","));
    const url = `${config.API_BASE}/api/v2/import?token=${encodedToken}&serverIds=${encodedServerIds}`;

    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Accept": "text/event-stream"
        },
        body: JSON.stringify({ privateId: privateId })
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

    return parseStream<PostImportGenericResponse>(response);
}