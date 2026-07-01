import { ValidationRule } from "@models/validation/ValidationRule";

export class StringValidationRule extends ValidationRule<unknown> {
    public constructor(notEmpty: boolean = false, invalidMsg?: string, validMsg?: string) {
        super(
            item => StringValidationRule.validate(item, notEmpty),
            invalidMsg,
            validMsg
        );
    }

    private static validate(item: unknown, notEmpty: boolean) {
        const isString = this.isString(item);

        if (!notEmpty) {
            return isString;
        }

        return isString && this.isNotEmpty(item);
    }

    private static isString(item: unknown) {
        return typeof item === "string";
    }

    private static isNotEmpty(item: string): boolean {
        return Boolean(item);
    }

}