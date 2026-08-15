import { StreamResponse } from "@api/contracts/StreamResponse.js";

export interface ErrorStreamResponse extends StreamResponse<null> {
    type: "error";
}