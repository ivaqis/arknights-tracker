export type Exact<T> = {
    [K in keyof T]: T[K];
} & { _?: never };