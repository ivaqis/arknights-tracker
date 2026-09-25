export enum LocaleOrder {
    A_Z = "a-z",
    Z_A = "z-a"
}

export namespace LocaleOrder {
    export function flip(value: LocaleOrder): LocaleOrder {
        switch (value) {
            case LocaleOrder.A_Z: return LocaleOrder.Z_A;
            case LocaleOrder.Z_A: return LocaleOrder.A_Z;
        }
    }

    export function getI18nKey(value: LocaleOrder): string {
        switch (value) {
            case LocaleOrder.A_Z: return "sort.localeName.a-z";
            case LocaleOrder.Z_A: return "sort.localeName.z-a";
        }
    }
}