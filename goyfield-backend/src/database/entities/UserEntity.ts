export interface UserEntity {
    uid: bigint,
    publicUid: string,
    firebaseUid: string | null,
    isPrivate: boolean,
    hideLeaderboard: boolean,
    hideUid: boolean,
    avatarId: string | null,
    backgroundId: string | null,
    favoriteChars?: string | null,
    displayAvatar: boolean,
    uploadCount: number,
    lastUploadReset: Date,
    createdAt: Date,
    updatedAt: Date
}