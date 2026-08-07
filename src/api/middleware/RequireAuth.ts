import { ResponseBody } from "@api/contracts/ResponseBody.js";
import { Middleware } from "@api/middleware/Middleware.js";
import { Authenticator } from "@services/auth/Authenticator.js";
import { AuthType } from "@services/auth/AuthType.js";
import e from "express";
import * as core from "express-serve-static-core";

export class RequireAuth extends Middleware<
    core.ParamsDictionary,
    unknown,
    unknown,
    unknown
> {
    public readonly name = "RequireAuth";

    private readonly _authTypeList: AuthType[];

    private constructor(req: e.Request<core.ParamsDictionary, ResponseBody<unknown>, unknown, unknown>, res: e.Response<ResponseBody<unknown>>, next: e.NextFunction, authTypeList: AuthType[]) {
        super(req, res, next);

        this._authTypeList = authTypeList;
    }

    public static require(...authTypes: AuthType[]): (req: e.Request<core.ParamsDictionary, ResponseBody<unknown>, unknown, unknown>, res: e.Response<ResponseBody<unknown>>, next: e.NextFunction) => Promise<void> {
        return async (req: e.Request<core.ParamsDictionary, ResponseBody<unknown>, unknown, unknown>, res: e.Response<ResponseBody<unknown>>, next: e.NextFunction) => {
            const middleware = new RequireAuth(req, res, next, authTypes);

            await middleware.safeExecute();
        }
    }

    protected async execute(): Promise<void> {
        const containsAuth = Authenticator.containsAuthHeader(this.req, ...this._authTypeList);

        if (!containsAuth) {
            this.status = 401;
            this.message = "Auth required";

            return;
        }
    }
}