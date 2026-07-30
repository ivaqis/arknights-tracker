export type Exact<T> = {
    [K in keyof T]: T[K];
} & { _?: never };

export function getUniqueElements(str: string, separator: string | RegExp) {
    const list = str.split(separator).filter(Boolean);

    return [...new Set(list)];
}