export class InvalidBannerEntityError extends Error {
    private static readonly MESSAGE: string = "Invalid banner entity";

    constructor(bannerObj?: object, ...messages: string[]) {
        let msg = InvalidBannerEntityError.getFullMsg(bannerObj, messages);

        super(msg);
        this.name = "InvalidBannerEntityError";
    }

    private static getFormattedErrorMessages(messages: string[]): string {
        let result = "";

        for (const message of messages) {
            result += `    ${message}\n`;
        }

        return result;
    }

    private static getFullMsg(bannerObj?: object, messages?: string[]): string {
        let msg = InvalidBannerEntityError.MESSAGE;

        if (messages && messages.length > 0) {
            msg += "\n" + InvalidBannerEntityError.getFormattedErrorMessages(messages);
        }

        if (bannerObj) {
            msg += `${bannerObj}`
        }

        return msg;
    }

}