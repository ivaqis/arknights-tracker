import { ValidationRule } from "@models/validation/ValidationRule.js";

export class GameUidValidationRule extends ValidationRule<unknown> {
    public static readonly REGEX: RegExp = /^\d+$/;

    public constructor(notEmpty: boolean = false, invalidMsg?: string, validMsg?: string) {
        super(
            item => typeof item === "string" && (notEmpty ? item.length > 0 : true) && GameUidValidationRule.REGEX.test(item),
            invalidMsg,
            validMsg
        );
    }
}