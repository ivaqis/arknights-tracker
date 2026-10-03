export interface BbValueFormat {
    display?: boolean;
}

export type BbValueFormatMap = Record<string, BbValueFormat>;
export type ReadonlyBbValueFormatMap = Readonly<BbValueFormatMap>;