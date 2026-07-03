export interface UserEntity {
    uid: bigint,
    firebaseUid?: string,
    isPrivate: boolean,
    name: string | null,
    avatarId: string | null,
    backgroundId: string | null,
    displayAvatar: boolean,
    uploadCount: number,
    lastUploadReset: Date,
    createdAt: Date,
    updatedAt: Date
}