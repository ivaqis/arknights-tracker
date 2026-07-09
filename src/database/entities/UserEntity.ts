export interface UserEntity {
    uid: bigint,
    publicUid: string,
    firebaseUid: string | null,
    isPrivate: boolean,
    avatarId: string | null,
    backgroundId: string | null,
    displayAvatar: boolean,
    uploadCount: number,
    lastUploadReset: Date,
    createdAt: Date,
    updatedAt: Date
}