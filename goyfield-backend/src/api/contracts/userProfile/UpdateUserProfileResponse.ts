import { IGameProfile } from "@api/contracts/userProfile/IGameProfile.js";

export interface UpdateUserProfileResponse {
    publicUid: string;
    isPrivate: boolean;
    avatarId: string | null;
    backgroundId: string | null;
    gameProfiles: IGameProfile[];
}