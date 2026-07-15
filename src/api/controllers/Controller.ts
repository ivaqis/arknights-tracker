import { logger } from "@/logger";
import { ResponseBody } from "@api/contracts/ResponseBody";
import e from "express";
import * as core from "express-serve-static-core";

export abstract class Controller<
    Params extends core.ParamsDictionary = core.ParamsDictionary,
    ResBody = any,
    ReqBody = any,
    ReqQuery = core.Query
> {
    private readonly _req: e.Request<Params, ResponseBody<ResBody>, ReqBody, ReqQuery>;
    private readonly _res: e.Response<ResponseBody<ResBody>>;

    private _status: number = 200;
    private _message: string = "";
    private _data: ResBody | null = null;

    protected constructor(req: e.Request<Params, ResponseBody<ResBody>, ReqBody, ReqQuery>, res: e.Response<ResponseBody<ResBody>>) {
        this._req = req;
        this._res = res;
    }

    public get message(): string {
        return this._message;
    }

    protected set message(value: string) {
        this._message = value;
    }

    public get data(): ResBody | null {
        return this._data;
    }

    protected set data(value: ResBody | null) {
        this._data = value;
    }

    public get status(): number {
        return this._status;
    }

    public abstract get name(): string;

    protected set status(value: number) {
        this._status = value;
    }

    protected get req(): e.Request<Params, ResponseBody<ResBody>, ReqBody, ReqQuery> {
        return this._req;
    }

    protected get res(): e.Response<ResponseBody<ResBody>> {
        return this._res;
    }

    protected abstract execute(): Promise<void>;

    protected async safeExecute(): Promise<void> {
        try {
            logger.debug(`[${this.name}] [${this._req.baseUrl}/] PROCESSING (${this._req.method} ${this._req.originalUrl})`);

            await this.execute();

            this.res
                .status(this.status)
                .json({
                    message: this._message,
                    data: this._data
                });

            logger.info(`[${this.name}] [${this._req.baseUrl}/] SENT ${this.status} ${this._req.method} ${this._req.originalUrl}`);
        } catch (e) {
            logger.error(`[${this.name}] [${this._req.baseUrl}/] ${this._req.method} ${this._req.originalUrl}\n${e}`);

            if (e instanceof Error) {
                logger.error(e.stack);
            }

            this.status = 500;
            this._res.status(500).json({
                message: "Internal Server Error",
                data: null
            });

            logger.info(`[${this.name}] [${this._req.baseUrl}/] SENT ${this.status} ${this._req.method} ${this._req.originalUrl}`);
        }
    }
}