import { CrisisContractEntity } from "@staticModels/crisisContracts/CrisisContractEntity";
import { RecordsModel } from "@staticModels/RecordsModel";

export class CrisisContractRecords extends RecordsModel<CrisisContractEntity> {
    private readonly _current: CrisisContractEntity;

    public constructor(list: CrisisContractEntity[]) {
        CrisisContractRecords.hasCurrentCheck(list);

        super(list, entity => entity.id, "CrisisContractRecords");

        this._current = this.getCurrent();
    }

    public get current(): CrisisContractEntity {
        return this._current;
    }

    public getContract(id: string): CrisisContractEntity | null {
        return this.get(id);
    }

    public isCurrent(id: string): boolean {
        const entity = this.getContract(id);

        if (!entity) {
            return false;
        }

        return entity.isCurrent;
    }

    protected isValid(obj: CrisisContractEntity): boolean {
        return true;
    }

    private getCurrent(): CrisisContractEntity {
        for (const item of this._records.values()) {
            if (item.isCurrent) {
                return item;
            }
        }

        throw new Error("Not Found");
    }

    private static hasCurrentCheck(list: CrisisContractEntity[]) {
        let has = false;

        for (const item of list) {
            if (item.isCurrent) {
                if (has) {
                    throw new Error("Must be only one current crisis contract");
                }

                has = true;
            }
        }

        if (!has) {
            throw new Error("Must be one current crisis contract");
        }
    }
}