import type { Readable, Writable } from "svelte/store";

export declare const isI18nReady: Writable<boolean>;

export declare const t: Readable<
    (key: string, vars?: Record<string, string | number>) => string
>;