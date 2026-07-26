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

    private readonly _url: URL;

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

        this._url = new URL(`http://localhost${this._req.originalUrl}`);
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

    protected async safeExecute(): Promise<void> {
        const pathname = this.fullPath;
        const routePath = `${this.baseUrl}${this.routePath}`;

        try {
            logger.debug(`[${this.name}] [${routePath}] PROCESSING (${this._req.method} ${pathname})`);

            await this.execute();

            if (this._status !== 200) {
                this.res.status(this._status).json({
                    message: this._message,
                    data: this._data
                });

                logger.http(`[${this.name}] [${routePath}] SENT ${this.status} ${this._req.method} ${pathname}`);
            } else {
                logger.debug(`[${this.name}] [${routePath}] NEXT CALLED (${this._req.method} ${pathname})`);

                this.next();
            }
        } catch (e) {
            logger.error(`[${this.name}] [${routePath}] ${this._req.method} ${pathname}\n${e}`);

            if (e instanceof Error) {
                logger.error(e.stack);
            }

            this.status = 500;
            this.res.status(500).json({
                message: "Internal Server Error",
                data: null
            });

            logger.http(`[${this.name}] [${routePath}] SENT ${this.status} ${this._req.method} ${pathname}`);
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