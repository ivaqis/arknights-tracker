import type { StreamResponse } from "$lib/api/StreamResponse";

export interface ErrorStreamResponse extends StreamResponse<null> {
    type: "error";
}