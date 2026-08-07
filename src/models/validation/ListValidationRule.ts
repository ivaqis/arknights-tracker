import { ValidationRule } from "@models/validation/ValidationRule.js";

export class ListValidationRule<T> extends ValidationRule<T[]> {
    public constructor(rule: ValidationRule<T>, invalidMsg?: string, validMsg?: string) {
        super(
            list => Array.isArray(list) && list.every(item => rule.isValid(item)),
            invalidMsg,
            validMsg
        );
    }
}