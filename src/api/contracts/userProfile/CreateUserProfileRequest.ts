export interface CreateUserProfileRequest {
    publicUid: string;
    isPrivate: boolean;
    avatarId: string | null;
    backgroundId: string | null;
}