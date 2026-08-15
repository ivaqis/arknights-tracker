import { CrisisContract } from "@staticModels/crisisContracts/CrisisContract.js";
import { CrisisContractEntity } from "@staticModels/crisisContracts/CrisisContractEntity.js";
import { RecordsModel } from "@staticModels/RecordsModel.js";

export class CrisisContractRecords {
    private readonly _byId: RecordsModel<CrisisContract>;
    private readonly _byApiId: RecordsModel<CrisisContract>;

    private readonly _current: CrisisContract;

    public constructor(list: CrisisContractEntity[]) {
        CrisisContractRecords.hasCurrentCheck(list);

        const objList = CrisisContractRecords.getList(list);

        this._byId = new RecordsModel(objList, obj => obj.id, "CrisisContractRecords.byId");
        this._byApiId = new RecordsModel(objList, obj => obj.apiId, "CrisisContractRecords.byApiId");

        this._current = CrisisContractRecords.getCurrent(objList);
    }

    public get current(): CrisisContract {
        return this._current;
    }

    public getContractById(id: string): CrisisContract | null {
        return this._byId.get(id);
    }

    public getContractByApiId(apiId: string): CrisisContract | null {
        return this._byApiId.get(apiId);
    }

    private static getCurrent(list: CrisisContract[]): CrisisContract {
        for (const item of list) {
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

    private static getList(list: CrisisContractEntity[]): CrisisContract[] {
        const result: CrisisContract[] = [];

        for (const item of list) {
            result.push(new CrisisContract(item));
        }

        return result;
    }
}