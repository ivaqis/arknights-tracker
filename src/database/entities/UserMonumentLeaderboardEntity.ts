export interface UserMonumentLeaderboardEntity {
    id: string,
    userGroupId: string,
    gameUid: string,
    dungeonId: string,
    groupId: string,
    isHard: boolean,
    clearTimeSec: number,
    data: string,
    updatedAt: Date
}