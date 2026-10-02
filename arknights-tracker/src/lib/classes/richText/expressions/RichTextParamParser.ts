import { ExpressionFormatter } from "$lib/classes/richText/expressions/formatter/ExpressionFormatter";
import type {
    ExpressionVariableResolver
} from "$lib/classes/richText/expressions/interpreter/ExpressionVariableResolver";
import {
    RichTextExpressionInterpreter
} from "$lib/classes/richText/expressions/interpreter/RichTextExpressionInterpreter";

export class RichTextParamParser {
    public static readonly REGEX = /{([^{}]+)}/g;

    private readonly _getValueFn: ExpressionVariableResolver;

    public constructor(getValueFn: ExpressionVariableResolver) {
        this._getValueFn = getValueFn;
    }

    public parse(param: string): string {
        const [expr, format] = param.split(":");

        if (/^\w+$/.test(expr)) {
            const value = this._getValueFn(expr);

            if (typeof value === "string") {
                return value;
            }
        }

        const interpreter = new RichTextExpressionInterpreter(this._getValueFn);

        const value = interpreter.evaluate(expr);

        if (!format) {
            return String(value);
        }

        return ExpressionFormatter.format(value, format);
    }

    public parseSafe(param: string): string {
        try {
            return this.parse(param);
        } catch (e) {
            console.error(e);

            return param;
        }
    }
}