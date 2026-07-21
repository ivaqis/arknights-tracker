import { StreamResponse } from "@api/contracts/StreamResponse";

export interface ErrorStreamResponse extends StreamResponse<null> {
    type: "error";
}