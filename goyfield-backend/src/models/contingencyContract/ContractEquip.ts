import { ContractEquipEntity } from "@models/contingencyContract/entities/ContractEquipEntity.js";
import { IEntityClass } from "@models/IEntityClass.js";
import { EquipData } from "@services/contractRecordFetcher/contracts/EquipData.js";

export class ContractEquip implements IEntityClass<ContractEquipEntity> {
    private readonly _id: string;
    private readonly _enhanceStatus: number;

    private constructor(id: string, enhanceStatus: number) {
        this._id = id;
        this._enhanceStatus = enhanceStatus;
    }

    public static getFromData(data?: EquipData): ContractEquip | null {
        if (!data) {
            return null;
        }

        return new ContractEquip(
            data.id,
            data.enhanceStatus
        );
    }

    public static getFromEntity(entity: ContractEquipEntity | null): ContractEquip | null {
        if (!entity) {
            return null;
        }

        return new ContractEquip(entity.id, entity.enhanceStatus);
    }

    public get id(): string {
        return this._id;
    }

    public get enhanceStatus(): number {
        return this._enhanceStatus;
    }

    public getEntity(): ContractEquipEntity {
        return {
            id: this.id,
            enhanceStatus: this.enhanceStatus
        };
    }
}