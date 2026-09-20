export interface HiveClass {
    class: string;
    value?: number;
    score?: number;
}

export interface HiveOutputItem {
    classes?: HiveClass[];
}

export interface HiveResponse {
    output?: HiveOutputItem[];
    status?: Array<{
        response?: {
            output?: HiveOutputItem[];
        };
    }>;
}
