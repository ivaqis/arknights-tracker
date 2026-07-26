import { PullEntity } from "@models/pulls/entities/PullEntity";

export interface WeaponPullEntity extends PullEntity {
    weaponId: string;
    weaponType: string;
}