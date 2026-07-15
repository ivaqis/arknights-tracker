import { ValidationRule } from "@models/validation/ValidationRule";

export class UsernameValidationRule extends ValidationRule<unknown> {
    public static readonly REGEX = /^\w+$/;

    public constructor(notEmpty: boolean = false, invalidMsg?: string, validMsg?: string) {
        super(
            item => typeof item === "string" && (notEmpty ? item.length > 0 : true) && UsernameValidationRule.REGEX.test(item),
            invalidMsg,
            validMsg
        );
    }
}