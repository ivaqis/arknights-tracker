export interface CreateUserProfileRequest {
    publicUid: string;
    isPrivate: boolean;
    avatarImage: string | null;
    filename: string | null;
    backgroundId: string | null;
}