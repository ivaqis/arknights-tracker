export interface MonumentLeaderboardGroupRunRecordEntity {
    uid: string;
    avatarId: string | null;
    level: number;
    serverId: string;
    groupId: string;
    gameUid: string; // todo публичный id группы
}