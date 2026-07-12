import { ResponseBody } from "@api/contracts/ResponseBody";
import { Middleware } from "@api/middleware/Middleware";
import { RequestValidatorConstructors } from "@api/middleware/validators/RequestValidatorConstructors";
import { Validator } from "@models/validation/Validator";
import e from "express";
import * as core from "express-serve-static-core";

export abstract class RequestValidator<
    Params extends core.ParamsDictionary,
    ReqBody,
    ReqQuery
> extends Middleware <
    Params,
    unknown,
    ReqBody,
    ReqQuery
> {
    private readonly _paramsValidatorConstructor?: new (params: Params) => Validator<Params>;
    private readonly _queryValidatorConstructor?: new (query: ReqQuery) => Validator<ReqQuery>;
    private readonly _bodyValidatorConstructor?: new (body: ReqBody) => Validator<ReqBody>;

    protected constructor(req: e.Request<Params, ResponseBody<unknown>, ReqBody, ReqQuery>,
                          res: e.Response<ResponseBody<unknown>>,
                          next: e.NextFunction,
                          validators: RequestValidatorConstructors<Params, ReqBody, ReqQuery>
    ) {
        super(req, res, next);

        this._paramsValidatorConstructor = validators.paramsValidatorConstructor;
        this._bodyValidatorConstructor = validators.bodyValidatorConstructor;
        this._queryValidatorConstructor = validators.queryValidatorConstructor;
    }

    protected async execute(): Promise<void> {
        const params = this.paramsValidate();

        if (!params) {
            return;
        }

        const query = this.queryValidate();

        if (!query) {
            return;
        }

        const body = this.bodyValidate();

        if (!body) {
            return;
        }
    }

    private queryValidate(): boolean {
        return this.validate(this.req.query, this._queryValidatorConstructor);
    }

    private bodyValidate(): boolean {
        return this.validate(this.req.body, this._bodyValidatorConstructor);
    }

    private paramsValidate(): boolean {
        return this.validate(this.req.params, this._paramsValidatorConstructor);
    }

    private validate<T>(item: T, ctor?: new (item: any) => Validator<T>): boolean {
        if (!ctor) {
            return true;
        }

        const validator = new ctor(item || {});

        if (!validator.isValid) {
            this.status = 400;
            this.message = validator.messages.join("\n");
            return false;
        }

        return true;
    }
}