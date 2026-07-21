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

    protected constructor(req: e.Request<Params, {}, ReqBody, ReqQuery>, res: e.Response<{}>) {
        this._req = req;
        this._res = res;
    }

    public abstract get name(): string;

    public get req(): e.Request<Params, {}, ReqBody, ReqQuery> {
        return this._req;
    }

    public get res(): e.Response<{}> {
        return this._res;
    }

    protected abstract execute(): Promise<void>;

    protected send(data: StreamResponse<ResBody>): void {
        const res = this._res;

        res.write(JSON.stringify(data) + "\n");

        if ("flush" in res && typeof res.flush === "function") {
            res.flush();
        }

        logger.info(`[${this.name}] [${this._req.baseUrl || "root"}${this.getRoutePath()}] SENT ${data.type} ${this._req.method} ${this._req.originalUrl}`)
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
        try {
            logger.debug(`[${this.name}] [${this._req.baseUrl || "root"}${this.getRoutePath()}] PROCESSING (${this._req.method} ${this._req.originalUrl})`);

            await this.execute();

            logger.info(`[${this.name}] [${this._req.baseUrl || "root"}${this.getRoutePath()}] ENDED SUCCESSFUL ${this._req.method} ${this._req.originalUrl}`);
        } catch (e) {
            logger.error(`[${this.name}] [${this._req.baseUrl || "root"}${this.getRoutePath()}] ${this._req.method} ${this._req.originalUrl}\n${e}`);

            if (e instanceof Error) {
                logger.error(e.stack);
            }

            this.sendError("Internal Server Error");
            this.res.end();

            logger.warn(`[${this.name}] [${this._req.baseUrl || "root"}${this.getRoutePath()}] ENDED WITH ERROR ${this._req.method} ${this._req.originalUrl}`);
        }
    }

    protected getRoutePath(): string {
        const path = this._req?.route?.path as string;

        if (!path || typeof path !== "string") {
            return "";
        }

        return path;
    }
}