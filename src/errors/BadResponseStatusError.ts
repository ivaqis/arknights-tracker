export class BadResponseStatusError extends Error {
    public constructor(status: number, response?: object) {
        let msg = `Bad response status: ${status}`

        if (response) {
            msg += `\n${JSON.stringify(response, null, 2)}`
        }

        super(msg);
    }
}