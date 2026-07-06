import { IndicatorEntity } from "@staticModels/crisisContracts/IndicatorEntity";
import { RecordsModel } from "@staticModels/RecordsModel";

export class IndicatorRecords {
    private readonly _byId: RecordsModel<IndicatorEntity>;
    private readonly _byNameId: RecordsModel<IndicatorEntity>;

    private readonly _name: string;

    public constructor(list: IndicatorEntity[], name: string) {
        this._name = name;
        this._byId = new RecordsModel(list, (entity) => entity.id, `${name}.byId`);
        this._byNameId = new RecordsModel(list, (entity) => entity.id, `${name}.byNameId`);
    }

    public getById(id: string): IndicatorEntity | null {
        return this._byId.get(id);
    }

    public getByNameId(nameId: string): IndicatorEntity | null {
        return this._byNameId.get(nameId);
    }
}