import { ValidationRule } from "@models/validation/ValidationRule";

export class GameUidValidationRule extends ValidationRule<unknown> {
    public static readonly REGEX: RegExp = /^\d+$/;

    public constructor(notEmpty: boolean = false, invalidMsg?: string, validMsg?: string) {
        super(
            item => typeof item === "string" && item.length > 0 && GameUidValidationRule.REGEX.test(item),
            invalidMsg,
            validMsg
        );
    }
}