import type { ExpressionToken } from "$lib/classes/richText/expressions/interpreter/ExpressionToken";
import type {
    ExpressionVariableResolver
} from "$lib/classes/richText/expressions/interpreter/ExpressionVariableResolver";

export class ExpressionParser {
    private readonly _getValueFn: ExpressionVariableResolver;
    private readonly _tokens: readonly ExpressionToken[];

    private _index: number = 0;

    public constructor(getValueFn: ExpressionVariableResolver, tokens: readonly ExpressionToken[]) {
        this._getValueFn = getValueFn;
        this._tokens = tokens;
    }

    public parse(): number {
        const result = this.parseExpression();

        if (this.peek().type !== "end") {
            throw new SyntaxError("Unexpected end of expression");
        }

        return result;
    }

    private getVariable(key: string): number {
        return this._getValueFn(key);
    }

    private peek(): ExpressionToken {
        return this._tokens[this._index]
            ?? { type: "end" };
    }

    private parseExpression(): number {
        return this.parseAdditive();
    }

    private parseAdditive(): number {
        let left = this.parseMultiplicative();

        let token = this.peek();

        while (token.type === "operator" && (token.value === "+" || token.value === "-")) {
            this._index++;

            const right = this.parseMultiplicative();

            if (token.value === "+") {
                left += right;
            } else if (token.value === "-") {
                left -= left;
            }

            token = this.peek();
        }

        return left;
    }

    private parseMultiplicative(): number {
        let left = this.parseUnary();

        let token = this.peek();

        while (token.type === "operator" && (token.value === "*" || token.value === "/")) {
            this._index++;

            const right = this.parseUnary();

            if (token.value === "*") {
                left *= right;
            } else if (token.value === "/") {
                left /= right;
            }

            token = this.peek();
        }

        return left;
    }

    private parseUnary(): number {
        const token = this.peek();

        if (token.type === "operator") {
            if (token.value === "-") {
                this._index++;

                return -this.parseUnary();
            }

            if (token.value === "+") {
                this._index++;

                return this.parseUnary();
            }
        }

        return this.parsePrimary();
    }

    private parsePrimary(): number {
        const token = this.peek();

        if (token.type === "number") {
            this._index++;

            return token.value;
        }

        if (token.type === "variable") {
            this._index++;

            return this.getVariable(token.value);
        }

        if (token.type === "lparen") {
            this._index++;

            const value = this.parseExpression();
            const closing = this.peek();

            if (closing.type !== "rparen") {
                throw new SyntaxError("')' expected");
            }

            this._index++;

            return value;
        }

        if (token.type === "end") {
            throw new SyntaxError("Empty expression");
        }

        throw new SyntaxError(`Unexpected token: ${token.type}`);
    }
}