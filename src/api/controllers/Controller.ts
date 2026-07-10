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
            await this.execute();

            this.res
                .status(this.status)
                .json({
                    message: this._message,
                    data: this._data
                });
        } catch (e) {
            logger.error(e);

            this.status = 500;
            this._res.status(500).json({
                message: "Internal Server Error",
                data: null
            });
        }
    }
}