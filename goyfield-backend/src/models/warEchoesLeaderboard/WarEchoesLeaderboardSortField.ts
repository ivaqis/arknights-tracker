export enum WarEchoesLeaderboardSortField {
    LEVEL = "level",
    TIME = "time"
}

export namespace WarEchoesLeaderboardSortField {
    export function isSortField(str: string): str is WarEchoesLeaderboardSortField {
        return str === WarEchoesLeaderboardSortField.TIME
            || str === WarEchoesLeaderboardSortField.LEVEL;
    }
}
