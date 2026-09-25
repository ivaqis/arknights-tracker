export interface UserGameProfileEntity {
    gameUid: string,
    serverId: string,
    uid: bigint,
    level: number,
    data: string,
    bannerProfileId: bigint | null
}