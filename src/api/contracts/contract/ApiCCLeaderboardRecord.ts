import { ApiCCLeaderboardCharacter } from "@api/contracts/contract/ApiCCLeaderboardCharacter";

export interface ApiCCLeaderboardRecord {
    recordId: string;
    contractId: string;
    ts: string;
    passTs: number;
    indicatorCount: number;
    chars: ApiCCLeaderboardCharacter[];
}