import { GameProfileEntity } from "@models/gameProfile/entities/GameProfileEntity";

export interface GetUserProfileResponse {
    publicUid: string;
    isPrivate: boolean;
    avatarId: string | null;
    backgroundId: string | null;
    gameProfiles: GameProfileEntity[];
}