export enum ContractLeaderboardSortField {
    LEVEL = "level",
    INDICATOR_COUNT = "indicatorCount",
    TIME = "time"
}

export namespace ContractLeaderboardSortField {
    export function isSortField(str: string): str is ContractLeaderboardSortField {
        return str === ContractLeaderboardSortField.LEVEL
            || str === ContractLeaderboardSortField.INDICATOR_COUNT
            || str === ContractLeaderboardSortField.TIME;
    }
}