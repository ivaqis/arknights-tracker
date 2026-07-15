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
    public readonly name = "RequireService";

    private readonly _requiredServices: IService[];

    private constructor(req: e.Request<core.ParamsDictionary, ResponseBody<unknown>, unknown, unknown>,
                        res: e.Response<ResponseBody<unknown>>,
                        next: e.NextFunction,
                        requiredServices: IService[]
    ) {
        super(req, res, next);

        this._requiredServices = requiredServices;
    }

    public static require(...services: IService[]): (req: e.Request<core.ParamsDictionary, ResponseBody<unknown>, unknown, unknown>, res: e.Response<ResponseBody<unknown>>, next: e.NextFunction) => Promise<void> {
        return async (req: e.Request<core.ParamsDictionary, ResponseBody<unknown>, unknown, unknown>, res: e.Response<ResponseBody<unknown>>, next: e.NextFunction) => {
            const middleware = new RequireService(req, res, next, services);

            await middleware.safeExecute();
        }
    }

    protected async execute(): Promise<void> {
        for (const service of this._requiredServices) {
            if (!service.isActive()) {
                this.status = 503;
                this.message = `Required service unavailable: ${service.name}`

                return;
            }
        }
    }
}