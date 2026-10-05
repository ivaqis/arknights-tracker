import { ExpressionParser } from "$lib/classes/richText/expressions/interpreter/ExpressionParser";
import { type ExpressionToken, isOperator } from "$lib/classes/richText/expressions/interpreter/ExpressionToken";
import type {
    ExpressionVariableResolver
} from "$lib/classes/richText/expressions/interpreter/ExpressionVariableResolver";

export class RichTextExpressionInterpreter {
    private static readonly ALLOWED_CHAR_REGEX = /[a-zA-Z0-9_\\]/;

    private readonly _getValueFn: ExpressionVariableResolver;

    public constructor(getValueFn: ExpressionVariableResolver) {
        this._getValueFn = getValueFn;
    }

    private static isVarChar(c: string): boolean {
        return this.ALLOWED_CHAR_REGEX.test(c);
    }

    private static isDigit(c: string | undefined): boolean {
        if (!c) {
            return false;
        }

        return /[0-9]/.test(c);
    }

    public evaluate(expression: string): number {
        const tokens = this.tokenize(expression);

        const map = this.getValuesMap(tokens);

        const parser = new ExpressionParser((key: string) => map[key], tokens);

        return parser.parse();
    }

    private getValuesMap(tokens: readonly ExpressionToken[]): Record<string, number> {
        const result: Record<string, number> = {};

        for (const token of tokens) {
            if (token.type !== "variable") {
                continue;
            }

            const value = this._getValueFn(token.value);

            if (typeof value !== "number") {
                throw new Error(`Variable '${token.value}' must be a number`);
            }

            result[token.value] = value;
        }

        return result;
    }

    private tokenize(input: string): ExpressionToken[] {
        const result: ExpressionToken[] = [];

        for (let i = 0; i < input.length; ) {
            const c = input[i];

            if (/\s/.test(c)) {
                continue;
            }

            if (c === "(") {
                result.push({ type: "lparen" });

                i++;
                continue;
            }

            if (c === ")") {
                result.push({ type: "rparen" });

                i++;
                continue;
            }

            if (isOperator(c)) {
                result.push({ type: "operator", value: c });

                i++;
                continue;
            }

            if (RichTextExpressionInterpreter.isDigit(c)) {
                let text = "";

                for (; i < input.length && (RichTextExpressionInterpreter.isDigit(input[i]) || input[i] === "."); i++) {
                    text += input[i];
                }

                const value = Number(text);

                if (isNaN(value)) {
                    throw new SyntaxError(`Incorrect number: ${text}`);
                }

                result.push({ type: "number", value: value });

                continue;
            }

            if (RichTextExpressionInterpreter.isVarChar(c)) {
                let text = "";

                for (; i < input.length && RichTextExpressionInterpreter.isVarChar(input[i]); i++) {
                    text += input[i];
                }

                result.push({ type: "variable", value: text });

                continue;
            }

            throw new SyntaxError(`Unexpected char: ${c}`);
        }

        result.push({ type: "end" });

        return result;
    }
}