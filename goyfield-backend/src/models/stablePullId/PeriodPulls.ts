import { Pull } from "@models/pulls/Pull.js";

export interface PeriodPulls<T extends Pull> {
    0: T[]; // monday
    1: T[];
    2: T[];
    3: T[];
    4: T[];
    5: T[];
    6: T[]; // sunday
}

export namespace PeriodPulls {
    export function createEmpty<T extends Pull>(): PeriodPulls<T> {
        return {
            0: [],
            1: [],
            2: [],
            3: [],
            4: [],
            5: [],
            6: []
        };
    }
}