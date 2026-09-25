export enum SortOrder {
    ASC = "asc",
    DESC = "desc",
}

export namespace SortOrder {
    export function isSortOrder(str: string): str is SortOrder {
        return str === SortOrder.ASC || str === SortOrder.DESC;
    }
}