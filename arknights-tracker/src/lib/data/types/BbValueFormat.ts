export interface BbValueFormat {
    display?: boolean;
    intl?: Intl.NumberFormatOptions;
    prefix?: string;
    postfix?: string;
}

export type BbValueFormatMap = Record<string, BbValueFormat>;
export type ReadonlyBbValueFormatMap = Readonly<BbValueFormatMap>;