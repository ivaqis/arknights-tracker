export enum MonumentLeaderboardSortField {
    LEVEL = "level",
    TIME = "time"
}

export namespace MonumentLeaderboardSortField {
    export function isSortField(str: string): str is MonumentLeaderboardSortField {
        return str === MonumentLeaderboardSortField.TIME
            || str === MonumentLeaderboardSortField.LEVEL;
    }
}