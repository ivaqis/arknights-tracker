import type { StreamResponse } from "$lib/api/StreamResponse";

export async function* parseStream<T extends StreamResponse<any>>(response: Response): AsyncGenerator<T, void, unknown> {
    if (!response.body) {
        throw new Error("Response has no body");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    let buffer = "";

    try {
        while (true) {
            const { done, value } = await reader.read();

            if (done) {
                break;
            }

            buffer += decoder.decode(value, { stream: true });

            const lines = buffer.split("\n");
            buffer = lines.pop() || "";

            for (const line of lines) {
                const trimmed = line.trim();
                if (!trimmed?.startsWith("data:")) {
                    continue;
                }

                const jsonStr = trimmed.slice(5).trim();
                if (!jsonStr) {
                    continue;
                }

                try {
                    const data = JSON.parse(jsonStr) as T;
                    yield data;
                } catch (e) {
                    console.error("Stream parse error:", e);
                }
            }
        }
    } finally {
        reader.releaseLock();
    }
}