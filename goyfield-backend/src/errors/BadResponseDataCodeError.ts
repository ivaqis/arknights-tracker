export class BadResponseDataCodeError extends Error {
    public constructor(code: number, responseData: object) {
        super(`Bad response data code: ${code}:\n${JSON.stringify(responseData, undefined, 2)}`);
    }
}