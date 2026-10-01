export class ExpressionFormatter {
    private readonly _formatter: Intl.NumberFormat;

    public constructor(format: string) {
        this._formatter = new Intl.NumberFormat(
            "en-US",
            ExpressionFormatter.getFormatOptions(format)
        );
    }

    public static format(value: number, format: string): string {
        const formatter = new ExpressionFormatter(format);

        return formatter.format(value);
    }

    private static getFormatOptions(format: string): Intl.NumberFormatOptions {
        let isPercent = false;
        let integerCount = 0;
        let decimalCount = 0;
        let decimalOptionalCount = 0;

        let isDecimalPart = false;

        for (let i = 0; i < format.length; i++) {
            let c = format[i];

            if (c === ".") {
                isDecimalPart = true;

                continue;
            }

            if (c === "0") {
                if (isDecimalPart) {
                    decimalCount++;
                }
                else {
                    integerCount++;
                }

                continue;
            }

            if (c === "#") {
                if (isDecimalPart) {
                    decimalOptionalCount++;
                }

                continue;
            }

            if (c === "%") {
                isPercent = true;

                continue;
            }

            throw new SyntaxError(`Incorrect format ${format} (${c})`);
        }

        return {
            style: isPercent ? "percent" : "decimal",
            minimumIntegerDigits: integerCount,
            minimumFractionDigits: decimalCount,
            maximumFractionDigits: decimalCount + decimalOptionalCount,
        };
    }

    public format(value: number): string {
        return this._formatter.format(value)
            .replace(",", " ");
    }
}