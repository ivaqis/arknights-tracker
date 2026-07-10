import { ResponseBody } from "@api/contracts/ResponseBody";
import e from "express";
import * as core from "express-serve-static-core";

export abstract class RequestValidator<
    Params extends core.ParamsDictionary = core.ParamsDictionary,
    ReqBody = any,
    ReqQuery = any
> {
    private readonly _req: e.Request<Params, ResponseBody<unknown>, ReqBody, ReqQuery>;
    private readonly _res: e.Response<ResponseBody<unknown>>;
    private readonly _next: e.NextFunction;

    private _status: number = 200;
    private _message: string = "";

    protected constructor(req: e.Request<Params, ResponseBody<unknown>, ReqBody, ReqQuery>,
                          res: e.Response<ResponseBody<unknown>>,
                          next: e.NextFunction
    ) {
        this._req = req;
        this._res = res;
        this._next = next;
    }

    protected get req(): e.Request<Params, ResponseBody<unknown>, ReqBody, ReqQuery> {
        return this._req;
    }

    protected get res(): e.Response<ResponseBody<unknown>> {
        return this._res;
    }

    protected get next(): e.NextFunction {
        return this._next;
    }

    public get status(): number {
        return this._status;
    }

    protected set status(value: number) {
        this._status = value;
    }

    public get message(): string {
        return this._message;
    }

    protected set message(value: string) {
        this._message = value;
    }

    protected abstract execute(): void;

    protected safeExecute(): void {
        try {
            this.execute();

            if (this._status !== 200) {
                this._res.status(this._status)
                    .json({
                        message: this._message,
                        data: null
                    });
                return;
            }

            this._next();

        } catch (e) {
            this._res.status(500)
                .json({
                    message: "Internal Server Error",
                    data: null
                });
        }
    }
}