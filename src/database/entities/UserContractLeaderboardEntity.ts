export interface UserContractLeaderboardEntity {
    id: string,
    recordId: string,
    gameUid: string,
    contractId: string,
    indicatorCount: number,
    clearTimeSec: number,
    data: string,
    updatedAt: Date
}