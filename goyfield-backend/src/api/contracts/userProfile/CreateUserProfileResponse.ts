import { IGameProfile } from "@api/contracts/userProfile/IGameProfile.js";

export interface CreateUserProfileResponse {
    publicUid: string;
    isPrivate: boolean;
    hideUid: boolean;
    avatarId: string | null;
    backgroundId: string | null;
    gameProfiles: IGameProfile[];
}