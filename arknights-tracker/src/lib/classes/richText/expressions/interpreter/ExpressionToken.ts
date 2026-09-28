export type ExpressionOperator = "+" | "-" | "*" | "/";

export type ExpressionToken =
    | { type: "number"; value: number }
    | { type: "variable"; value: string }
    | { type: "operator"; value: ExpressionOperator }
    | { type: "lparen" }
    | { type: "rparen" }
    | { type: "end" };

export function isOperator(str: string): str is ExpressionOperator {
    return str === "+"
        || str === "-"
        || str === "*"
        || str === "/";
}