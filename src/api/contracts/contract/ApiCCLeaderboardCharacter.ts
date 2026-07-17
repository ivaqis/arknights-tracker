import { ApiCCLeaderboardWeapon } from "@api/contracts/contract/ApiCCLeaderboardWeapon";

export interface ApiCCLeaderboardCharacter {
    id: string;
    level: number;
    potentialLevel: number;
    weapon: ApiCCLeaderboardWeapon | null;
}