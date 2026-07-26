import { logger } from "@/logger";
import { ErrorStreamResponse } from "@api/contracts/ErrorStreamResponse";
import { StreamResponse } from "@api/contracts/StreamResponse";
import e from "express";
import * as core from "express-serve-static-core";

export abstract class StreamController<
    Params extends core.ParamsDictionary = core.ParamsDictionary,
    ResBody = any,
    ReqBody = any,
    ReqQuery = core.Query
> {
    private readonly _req: e.Request<Params, {}, ReqBody, ReqQuery>;
    private readonly _res: e.Response<{}>;

    private readonly _url: URL;

    protected constructor(req: e.Request<Params, {}, ReqBody, ReqQuery>, res: e.Response<{}>) {
        this._req = req;
        this._res = res;

        this._url = new URL(`http://localhost${this._req.originalUrl}`);
    }

    public abstract get name(): string;

    public get req(): e.Request<Params, {}, ReqBody, ReqQuery> {
        return this._req;
    }

    public get res(): e.Response<{}> {
        return this._res;
    }

    protected get fullPath(): string {
        return this._url.pathname || "/";
    }

    protected get baseUrl(): string {
        return this._req.baseUrl || "root";
    }

    protected get routePath(): string {
        return this.getRoutePath();
    }

    protected abstract execute(): Promise<void>;

    protected send(data: StreamResponse<ResBody>): void {
        const res = this._res;

        res.write(`data: ${JSON.stringify(data)}\n\n`);

        if ("flush" in res && typeof res.flush === "function") {
            res.flush();
        }

        logger.http(`[${this.name}] [${this.baseUrl}${this.routePath}] SENT ${data.type} ${this._req.method} ${this.fullPath}`)
    }

    protected sendError(message: string) {
        const err: ErrorStreamResponse = {
            type: "error",
            message,
            data: null
        };

        this.send(err);
    }

    protected async safeExecute(): Promise<void> {
        const pathname = this.fullPath;
        const routePath = `${this.baseUrl}${this.routePath}`;

        try {
            logger.debug(`[${this.name}] [${routePath}] PROCESSING (${this._req.method} ${pathname})`);

            this._res.writeHead(200, {
                "Content-Type": "text/event-stream; charset=utf-8",
                "Cache-Control": "no-cache, no-transform",
                "Connection": "keep-alive",
                "X-Accel-Buffering": "no",
                "Transfer-Encoding": "chunked"
            });

            await this.execute();

            this._res.end();

            logger.http(`[${this.name}] [${routePath}] ENDED SUCCESSFUL ${this._req.method} ${pathname}`);
        } catch (e) {
            logger.error(`[${this.name}] [${routePath}] ${this._req.method} ${pathname}\n${e}`);

            if (e instanceof Error) {
                logger.error(e.stack);
            }

            this.sendError("Internal Server Error");
            this.res.end();

            logger.warn(`[${this.name}] [${routePath}] ENDED WITH ERROR ${this._req.method} ${pathname}`);
        }
    }

    private getRoutePath(): string {
        const path = this._req?.route?.path as string;

        if (!path || typeof path !== "string") {
            return "";
        }

        return path;
    }
}