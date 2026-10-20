export interface UpdateUserProfileRequest {
    newUid?: string;
    isPrivate?: boolean;
    hideLeaderboard?: boolean;
    hideUid?: boolean;
    backgroundId?: string;
    favoriteChars?: string[];
}