import type { PullData } from "$lib/api/import/contracts/pulls/PullData";

export interface WeaponPullData extends PullData {
    weaponId: string;
    weaponName: string;
    weaponType: string;
}