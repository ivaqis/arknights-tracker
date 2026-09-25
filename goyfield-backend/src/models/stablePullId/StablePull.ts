export class StablePull {
    // do not change the order of fields
    public readonly itemId: string;
    public readonly isFree: boolean;
    public readonly bannerId: string;
    public readonly rarity: number;
    public readonly isNew: boolean;
    public readonly gachaTs: string;
    public readonly seqId: string;

    public constructor(itemId: string, isFree: boolean, bannerId: string, rarity: number, isNew: boolean, gachaTs: string, seqId: string) {
        this.itemId = itemId;
        this.isFree = isFree;
        this.bannerId = bannerId;
        this.rarity = rarity;
        this.isNew = isNew;
        this.gachaTs = gachaTs;
        this.seqId = seqId;
    }
}