import { logger } from "@/logger";
import { ResponseBody } from "@api/contracts/ResponseBody";
import { Middleware } from "@api/middleware/Middleware";
import e from "express";
import * as core from "express-serve-static-core";

export class JsonRequestValidator extends Middleware<
    core.ParamsDictionary,
    unknown,
    unknown,
    unknown
> {
    public readonly name = "JsonRequestValidator";

    private constructor(req: e.Request<core.ParamsDictionary, ResponseBody<unknown>, unknown, unknown>, res: e.Response<ResponseBody<unknown>>, next: e.NextFunction) {
        super(req, res, next);
    }

    public static async isJson(req: e.Request<core.ParamsDictionary, ResponseBody<unknown>, unknown, unknown>, res: e.Response<ResponseBody<unknown>>, next: e.NextFunction) {
        const validator = new JsonRequestValidator(req, res, next);

        await validator.safeExecute();
    }

    protected async execute(): Promise<void> {
        if (!this.req.is("application/json")) {
            this.status = 415;
            this.message = "Only json allowed";

            return;
        }

        if (typeof this.req.body !== "object") {
            this.status = 400;
            this.message = "Request must have a body";

            return;
        }
    }
}