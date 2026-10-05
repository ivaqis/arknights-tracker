export interface CreateUserProfileRequest {
    publicUid: string;
    isPrivate: boolean;
    hideUid?: boolean;
    avatarImage: string | null;
    filename: string | null;
    backgroundId: string | null;
}