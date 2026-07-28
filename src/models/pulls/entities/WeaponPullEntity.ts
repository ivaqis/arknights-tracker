import { PullEntity } from "@models/pulls/entities/PullEntity";

export interface WeaponPullEntity extends PullEntity {
    weaponId: string;
    weaponName: string;
    weaponType: string;
}