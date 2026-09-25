import { Indicator } from "@staticModels/crisisContracts/Indicator.js";
import { IndicatorEntity } from "@staticModels/crisisContracts/IndicatorEntity.js";
import { RecordsModel } from "@staticModels/RecordsModel.js";

export class IndicatorRecords {
    private readonly _byId: RecordsModel<Indicator>;
    private readonly _byNameId: RecordsModel<Indicator>;

    private readonly _name: string;

    public constructor(list: IndicatorEntity[], name: string) {
        this._name = name;

        const objList = IndicatorRecords.getList(list);

        this._byId = new RecordsModel(objList, (entity) => entity.id, `${name}.byId`);
        this._byNameId = new RecordsModel(objList, (entity) => entity.nameId, `${name}.byNameId`);
    }

    public getById(id: string): Indicator | null {
        return this._byId.get(id);
    }

    public getByNameId(nameId: string): Indicator | null {
        return this._byNameId.get(nameId);
    }

    private static getList(list: IndicatorEntity[]): Indicator[] {
        const result: Indicator[] = [];

        for (const item of list) {
            result.push(new Indicator(item));
        }

        return result;
    }
}