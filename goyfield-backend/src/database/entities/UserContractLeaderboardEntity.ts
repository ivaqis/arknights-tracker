export interface UserContractLeaderboardEntity {
    id: string,
    recordId: string,
    gameUid: string,
    contractId: string,
    indicatorCount: number,
    clearTimeSec: number,
    videoUrl: string | null,
    videoCode: string | null,
    data: string,
    updatedAt: Date
}
