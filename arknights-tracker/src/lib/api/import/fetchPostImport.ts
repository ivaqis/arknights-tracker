import type { PostImportGenericResponse } from "$lib/api/import/contracts/PostImportGenericResponse";
import { parseStream } from "$lib/api/parseStream";
import { config } from "$lib/config";

export async function fetchPostImport(token: string, serverIds: string[], privateId: string | null): Promise<AsyncGenerator<PostImportGenericResponse, void, unknown>> {
    const url = `${config.API_BASE}/api/v2/import?token=${token}&serverIds=${serverIds.join(",")}`;

    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
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