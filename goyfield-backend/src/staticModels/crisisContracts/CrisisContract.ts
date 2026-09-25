import { CrisisContractEntity } from "@staticModels/crisisContracts/CrisisContractEntity.js";
import { IndicatorRecords } from "@staticModels/crisisContracts/IndicatorRecords.js";

export class CrisisContract {
    private readonly _entity: CrisisContractEntity;

    private readonly _indicatorRecords: IndicatorRecords;

    public constructor(entity: CrisisContractEntity) {
        this._entity = entity;

        this._indicatorRecords = new IndicatorRecords(entity.indicators, entity.id);
    }

    public get id(): string {
        return this._entity.id;
    }

    public get apiId(): string {
        return this._entity.apiId;
    }

    public get isCurrent(): boolean {
        return this._entity.isCurrent ?? false;
    }

    public get indicatorRecords(): IndicatorRecords {
        return this._indicatorRecords;
    }
}