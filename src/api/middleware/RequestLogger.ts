import { logger } from "@/logger";
import { ResponseBody } from "@api/contracts/ResponseBody";
import { Middleware } from "@api/middleware/Middleware";
import e from "express";
import * as core from "express-serve-static-core";

export class RequestLogger extends Middleware<
    core.ParamsDictionary,
    unknown,
    unknown,
    unknown
> {
    public readonly name = "RequestLogger";

    private constructor(req: e.Request<core.ParamsDictionary, ResponseBody<unknown>, unknown, unknown>, res: e.Response<ResponseBody<unknown>>, next: e.NextFunction) {
        super(req, res, next);
    }

    public static async handle(req: e.Request<core.ParamsDictionary, ResponseBody<unknown>, unknown, unknown>, res: e.Response<ResponseBody<unknown>>, next: e.NextFunction) {
        const handler = new RequestLogger(req, res, next);

        await handler.safeExecute();
    }

    protected async execute(): Promise<void> {
        logger.http(`[REQUEST RECEIVED] ${this.req.method.toUpperCase()} ${this.fullPath}`);
        logger.debug(`[REQUEST PARAMS] ${JSON.stringify(this.req.params, null, 2)}`);
        logger.debug(`[REQUEST QUERY] ${JSON.stringify(this.req.query, null, 2)}`);
        logger.debug(`[REQUEST BODY] ${JSON.stringify(this.req.body, null, 2)}`);
    }
}