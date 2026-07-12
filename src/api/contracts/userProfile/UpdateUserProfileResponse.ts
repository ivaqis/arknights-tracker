import { IGameProfile } from "@api/contracts/userProfile/IGameProfile";

export interface UpdateUserProfileResponse {
    publicUid: string;
    isPrivate: boolean;
    avatarId: string | null;
    backgroundId: string | null;
    gameProfiles: IGameProfile[];
}