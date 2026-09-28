export class RichTextParamParser {
    public static REGEX_GLOBAL: RegExp = /{[^{}]+}/g;

    private readonly _getValueFn: (key: string, ns: string | null) => number;

    public constructor(getValueFn: (key: string, ns: (string | null)) => number) {
        this._getValueFn = getValueFn;
    }

    private static formatValue(value: number, format: string): string {
        const isPercent = format.endsWith("%");

        format = format.replace("%", "");

        const [n, fraction] = format.split(".").map(str => str.length);

        const formatter = Intl.NumberFormat("en-US", {
            minimumIntegerDigits: n,
            minimumFractionDigits: fraction ?? 0,
            maximumFractionDigits: fraction ?? 0,
            style: isPercent ? "percent" : undefined,
            useGrouping: false,
        });

        return formatter.format(value);
    }

    public formatRaw(rawStr: string): string {
        if (!rawStr.startsWith("{") || !rawStr.endsWith("}") || !rawStr.includes(":")) {
            throw new Error("String must be start with '{' and end with '}' and have ':'");
        }

        let sliced = rawStr.slice(1, rawStr.length - 1);
        let reverse = false;

        if (sliced.startsWith("-")) {
            reverse = true;
            sliced = sliced.slice(1);
        }

        const [param, format] = sliced.split(":");

        const splitParam = param.split("\\");

        const key = splitParam.length > 1 ? splitParam[1] : splitParam[0];
        const ns = splitParam.length > 1 ? splitParam[0] : null;

        const value = this._getValueFn(key, ns) * (reverse ? -1 : 1);

        return RichTextParamParser.formatValue(value, format);
    }
}

