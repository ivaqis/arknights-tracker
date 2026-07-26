import { PullEntity } from "@models/pulls/entities/PullEntity";

export interface CharPullEntity extends PullEntity {
    charId: string;
    isFree: boolean;
}