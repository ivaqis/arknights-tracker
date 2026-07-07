import { logger } from "@/logger";
import { ContractStatusData } from "@services/skportDetailFetcher/contracts/ContractStatusData";
import { contractNameRecords } from "@staticModels/instances";

export class ContractStatus {
    private readonly _id: string;
    private readonly _apiId: string;

    private constructor(id: string, apiId: string) {
        this._id = id;
        this._apiId = apiId;
    }

    public static get(data: ContractStatusData): ContractStatus | null {
        const id = contractNameRecords.getId(data.name);

        if (!id) {
            logger.warn(`contractId not found:\n${JSON.stringify(data, undefined, 2)}`);

            return null;
        }

        return new ContractStatus(id, data.id);
    }

    public static getList(list: ContractStatusData[]): ContractStatus[] {
        const result: ContractStatus[] = [];

        for (const item of list) {
            let contract = this.get(item);

            if (!contract) {
                continue;
            }

            result.push(contract);
        }

        return result;
    }

    public get id(): string {
        return this._id;
    }

    public get apiId(): string {
        return this._apiId;
    }
}