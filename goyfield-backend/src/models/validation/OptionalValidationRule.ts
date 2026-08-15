import { ValidationRule } from "@models/validation/ValidationRule.js";

export class OptionalValidationRule<T> extends ValidationRule<T> {
    public constructor(mainRule: ValidationRule<T>, invalidMsg?: string, validMsg?: string) {
        super(
            item => OptionalValidationRule.isNullOrUndefined(item) || mainRule.isValid(item),
            invalidMsg,
            validMsg
        );
    }

    private static isNullOrUndefined(item: unknown): boolean {
        return item === null || item === undefined;
    }
}