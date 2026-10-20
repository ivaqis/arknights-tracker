import { IGameProfile } from "@api/contracts/userProfile/IGameProfile.js";

export interface GetUserProfileResponse {
    publicUid: string;
    isPrivate: boolean;
    hideLeaderboard: boolean;
    hideUid: boolean;
    avatarId: string | null;
    backgroundId: string | null;
    favoriteChars: string[];
    gameProfiles: IGameProfile[];
}