import { ValidationRule } from "@models/validation/ValidationRule.js";

export class Validator<T> {
    private readonly _messages: string[] = [];

    private readonly _rules: readonly ValidationRule<T>[];
    private readonly _isValid: boolean;
    private readonly _item: T;

    public constructor(item: T, rules: ValidationRule<T>[]) {
        this._rules = rules;
        this._item = item;

        this._isValid = this.validate();
    }

    public get messages(): string[] {
        return this._messages;
    }

    public get isValid(): boolean {
        return this._isValid;
    }

    public get item(): T {
        return this._item;
    }

    private validate(): boolean {
        let isValid: boolean = true;

        for (const rule of this._rules) {
            const valid = rule.isValid(this._item);

            if (!valid) {
                isValid = false;

                if (rule.invalidMsg) {
                    this._messages.push(rule.invalidMsg);
                }
            }
        }

        return isValid;
    }
}
