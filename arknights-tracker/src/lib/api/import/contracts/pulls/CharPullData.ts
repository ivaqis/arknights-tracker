import type { PullData } from "$lib/api/import/contracts/pulls/PullData";

export interface CharPullData extends PullData {
    charId: string;
    charName: string;
    isFree: boolean;
}