import { IGameProfile } from "@api/contracts/userProfile/IGameProfile";

export interface GetUserProfileResponse {
    publicUid: string;
    isPrivate: boolean;
    avatarId: string | null;
    backgroundId: string | null;
    gameProfiles: IGameProfile[];
}