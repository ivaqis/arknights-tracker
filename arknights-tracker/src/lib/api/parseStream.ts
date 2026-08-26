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

            buffer = buffer.replaceAll("\r", "");

            let separatorIndex = buffer.indexOf("\n\n");

            while (separatorIndex !== -1) {
                const rawEvent = buffer.slice(0, separatorIndex);
                buffer = buffer.slice(separatorIndex + 2);

                separatorIndex = buffer.indexOf("\n\n");

                if (!rawEvent.trim()) {
                    continue;
                }

                const dataLines = rawEvent
                    .split("\n")
                    .filter((line) => line.startsWith("data:"))
                    .map((line) => line.slice(5).replace(/^ /, ""));

                if (dataLines.length !== 1) {
                    continue;
                }

                const data = JSON.parse(dataLines[0]) as T;

                yield data;
            }
        }
    } finally {
        reader.releaseLock();
    }
}