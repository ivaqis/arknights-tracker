export interface UserEntity {
    uid: bigint,
    firebaseUid?: string,
    isPrivate: boolean,
    name?: string,
    avatarId?: string,
    backgroundId?: string,
    displayAvatar: boolean,
    uploadCount: number,
    lastUploadReset: Date,
    createdAt: Date,
    updatedAt: Date
}