import { ValidationRule } from "@models/validation/ValidationRule.js";

export class BooleanStringValidationRule extends ValidationRule<unknown> {

    public constructor(invalidMsg?: string, validMsg?: string) {
        super(
            item => typeof item === "string" && (item === "true" || item === "false"),
            invalidMsg,
            validMsg
        );
    }
}

export type BooleanString = "true" | "false";