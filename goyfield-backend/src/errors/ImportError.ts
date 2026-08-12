export class ImportError extends Error {
    public readonly url: string;
    public readonly serverId?: string;

    public constructor(message: string, url: string, serverId?: string) {
        super(message);

        this.url = url;
        this.serverId = serverId;

        this.name = "ImportError";
    }
}