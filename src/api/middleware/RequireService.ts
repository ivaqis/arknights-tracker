import { ResponseBody } from "@api/contracts/ResponseBody";
import { Middleware } from "@api/middleware/Middleware";
import { IService } from "@services/IService";
import e from "express";
import * as core from "express-serve-static-core";

export class RequireService extends Middleware<
    core.ParamsDictionary,
    unknown,
    unknown,
    unknown
> {
    private readonly _requiredService: IService;

    private constructor(req: e.Request<core.ParamsDictionary, ResponseBody<unknown>, unknown, unknown>,
                        res: e.Response<ResponseBody<unknown>>,
                        next: e.NextFunction,
                        requiredService: IService
    ) {
        super(req, res, next);

        this._requiredService = requiredService;
    }

    public static require(service: IService): (req: e.Request<core.ParamsDictionary, ResponseBody<unknown>, unknown, unknown>, res: e.Response<ResponseBody<unknown>>, next: e.NextFunction) => Promise<void> {
        return async (req: e.Request<core.ParamsDictionary, ResponseBody<unknown>, unknown, unknown>, res: e.Response<ResponseBody<unknown>>, next: e.NextFunction) => {
            const middleware = new RequireService(req, res, next, service);

            await middleware.safeExecute();
        }
    }

    protected async execute(): Promise<void> {
        if (!this._requiredService.isActive()) {
            this.status = 503;
            this.message = `Required service unavailable: ${this._requiredService.name}`
        }
    }
}