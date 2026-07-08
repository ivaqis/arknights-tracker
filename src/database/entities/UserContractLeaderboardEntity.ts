export interface UserContractLeaderboardEntity {
    recordId: string,
    gameUid: string,
    contractId: string,
    indicatorCount: number,
    clearTimeSec: number,
    data: string,
    updatedAt: Date
}