import { logger } from "@/logger";
import { ResponseBody } from "@api/contracts/ResponseBody";
import e from "express";
import * as core from "express-serve-static-core";

export abstract class Middleware<
    Params extends core.ParamsDictionary = core.ParamsDictionary,
    ResBody = any,
    ReqBody = any,
    ReqQuery = core.Query
> {
    private readonly _req: e.Request<Params, ResponseBody<ResBody>, ReqBody, ReqQuery>;
    private readonly _res: e.Response<ResponseBody<ResBody>>;
    private readonly _next: e.NextFunction;

    private _status: number = 200;
    private _message: string = "";
    private _data: ResBody | null = null;

    protected constructor(req: e.Request<Params, ResponseBody<ResBody>, ReqBody, ReqQuery>,
                          res: e.Response<ResponseBody<ResBody>>,
                          next: e.NextFunction
    ) {
        this._req = req;
        this._res = res;
        this._next = next;
    }

    protected get req(): e.Request<Params, ResponseBody<ResBody>, ReqBody, ReqQuery> {
        return this._req;
    }

    protected get res(): e.Response<ResponseBody<ResBody>> {
        return this._res;
    }

    protected get next(): e.NextFunction {
        return this._next;
    }

    public get status(): number {
        return this._status;
    }

    public abstract get name(): string;

    protected set status(value: number) {
        this._status = value;
    }

    public get message(): string {
        return this._message;
    }

    protected set message(value: string) {
        this._message = value;
    }

    protected abstract execute(): Promise<void>;

    protected async safeExecute(): Promise<void> {
        try {
            logger.debug(`[${this.name}] [${this._req.baseUrl || "root"}${this.getRoutePath()}] PROCESSING (${this._req.method} ${this._req.originalUrl})`);

            await this.execute();

            if (this._status !== 200) {
                this.res.status(this._status).json({
                    message: this._message,
                    data: this._data
                });

                logger.info(`[${this.name}] [${this._req.baseUrl || "root"}${this.getRoutePath()}] SENT ${this.status} ${this._req.method} ${this._req.originalUrl}`);
            } else {
                logger.debug(`[${this.name}] [${this._req.baseUrl || "root"}${this.getRoutePath()}] NEXT CALLED (${this._req.method} ${this._req.originalUrl})`);

                this.next();
            }
        } catch (e) {
            logger.error(`[${this.name}] [${this._req.baseUrl || "root"}${this.getRoutePath()}] ${this._req.method} ${this._req.originalUrl}\n${e}`);

            if (e instanceof Error) {
                logger.error(e.stack);
            }

            this.status = 500;
            this.res.status(500).json({
                message: "Internal Server Error",
                data: null
            });

            logger.info(`[${this.name}] [${this._req.baseUrl || "root"}${this.getRoutePath()}] SENT ${this.status} ${this._req.method} ${this._req.originalUrl}`);
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