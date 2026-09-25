import { PullEntity } from "@models/pulls/entities/PullEntity.js";

export interface CharPullEntity extends PullEntity {
    charId: string;
    charName: string;
    isFree: boolean;
}