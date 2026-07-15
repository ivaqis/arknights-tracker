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
        logger.info(`Request received: ${this.req.method.toUpperCase()} ${this.req.originalUrl}`);
    }
}