import { Validator } from "@models/validation/Validator.js";

export interface RequestValidatorConstructors<
    Params = {},
    ReqBody = {},
    ReqQuery = {}
> {
    queryValidatorConstructor?: new (query: ReqQuery) => Validator<ReqQuery>;
    bodyValidatorConstructor?: new (body: ReqBody) => Validator<ReqBody>;
    paramsValidatorConstructor?: new (params: Params) => Validator<Params>;
}