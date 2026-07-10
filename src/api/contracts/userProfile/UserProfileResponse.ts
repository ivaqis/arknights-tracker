import { GameProfileEntity } from "@models/gameProfile/entities/GameProfileEntity";

export interface UserProfileResponse {
    publicUid: string;
    isPrivate: boolean;
    avatarId: string | null;
    backgroundId: string | null;
    gameProfiles: GameProfileEntity[];
}