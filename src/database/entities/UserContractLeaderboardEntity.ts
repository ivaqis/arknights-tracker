export interface UserContractLeaderboardEntity {
    gameUid: string,
    contractId: string,
    recordId: string,
    indicatorCount: number,
    clearTimeSec: number,
    data: string,
    updatedAt: Date
}