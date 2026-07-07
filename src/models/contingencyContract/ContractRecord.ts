import { logger } from "@/logger";
import { ContractCharacter } from "@models/contingencyContract/ContractCharacter";
import { ContractRecordEntity } from "@models/contingencyContract/entities/ContractRecordEntity";
import { Character } from "@models/gameProfile/Character";
import { IEntityClass } from "@models/IEntityClass";
import { CharData } from "@services/contractRecordFetcher/contracts/CharData";
import { ContractRecordDetailData } from "@services/contractRecordFetcher/contracts/ContractRecordDetailData";
import { IndicatorData } from "@services/contractRecordFetcher/contracts/IndicatorData";
import { crisisContractRecords } from "@staticModels/instances";

export class ContractRecord implements IEntityClass<ContractRecordEntity> {
    private readonly _id: string;
    private readonly _contractId: string;
    private readonly _ts: string;
    private readonly _passTs: string;
    private readonly _isPass: boolean;
    private readonly _indicatorCount: number;
    private readonly _passWave: number;
    private readonly _isBest: boolean;
    private readonly _indicators: string[];
    private readonly _chars: ContractCharacter[];

    private constructor(id: string,
                        contractId: string,
                        ts: string,
                        passTs: string,
                        isPass: boolean,
                        indicatorCount: number,
                        passWave: number,
                        isBest: boolean,
                        indicators: string[],
                        chars: ContractCharacter[]
    ) {
        this._id = id;
        this._contractId = contractId;
        this._ts = ts;
        this._passTs = passTs;
        this._isPass = isPass;
        this._indicatorCount = indicatorCount;
        this._passWave = passWave;
        this._isBest = isBest;
        this._indicators = indicators;
        this._chars = chars;
    }

    public static getFromData(data: ContractRecordDetailData,
                              profileChars: Character[],
                              contractId: string,
    ): ContractRecord {
        return new ContractRecord(
            data.id,
            contractId,
            data.ts,
            data.passTs,
            data.isPass,
            data.indicatorCount,
            data.passWave,
            data.isBest,
            this.getIndicators(data.indicators, data.indicatorIds, contractId),
            this.getChars(data.chars, profileChars)
        );
    }

    public static getFromEntity(entity: ContractRecordEntity, recordId: string): ContractRecord {
        return new ContractRecord(
            recordId,
            entity.contractId,
            entity.ts,
            entity.passTs,
            entity.isPass,
            entity.indicatorCount,
            entity.passWave,
            entity.isBest,
            entity.indicators,
            entity.chars.map(char => ContractCharacter.getFromEntity(char))
        );
    }

    private static getChars(chars: CharData[], profileChars: Character[]): ContractCharacter[] {
        const map = this.getCharMap(profileChars);
        const result: ContractCharacter[] = [];

        for (const char of chars) {
            let profileChar = map.get(char.charId);

            if (!profileChar) {
                logger.warn(`Could not find char "${char.charId}"`);

                continue;
            }

            let cChar = ContractCharacter.getFromData(char, profileChar);
            result.push(cChar);
        }

        return result;
    }

    private static getCharMap(profileChars: Character[]): Map<string, Character> {
        let map = new Map<string, Character>();

        for (const char of profileChars) {
            map.set(char.apiId, char);
        }

        return map;
    }

    private static getIndicators(all: IndicatorData[], active: string[], contractId: string): string[] {
        const map = this.getIndicatorMap(all, contractId);
        const result: string[] = [];

        for (const item of active) {
            let id = map.get(item);

            if (!id) {
                logger.warn(`Indicator is not in map ${contractId} ${item}`);

                continue;
            }

            result.push(id);
        }

        return result;
    }

    private static getIndicatorMap(all: IndicatorData[], contractId: string): Map<string, string> {
        const map = new Map<string, string>();

        for (const item of all) {
            let id: string;

            try {
                id = this.getIndicatorId(item, contractId);
            } catch (e) {
                logger.warn(e);

                continue;
            }

            map.set(item.id, id);
        }

        return map;
    }

    private static getIndicatorId(indicator: IndicatorData, contractId: string): string {
        const nameId = `${indicator.name}_${indicator.score}`;

        const id = crisisContractRecords
            .getContractById(contractId)
            ?.indicatorRecords
            .getByNameId(nameId)
            ?.id;

        if (!id) {
            throw new Error(`Could not find indicator ${contractId} ${nameId}`);
        }

        return id;
    }

    public get id(): string {
        return this._id;
    }

    public get contractId(): string {
        return this._contractId;
    }

    public get ts(): string {
        return this._ts;
    }

    public get passTs(): string {
        return this._passTs;
    }

    public get isPass(): boolean {
        return this._isPass;
    }

    public get indicatorCount(): number {
        return this._indicatorCount;
    }

    public get passWave(): number {
        return this._passWave;
    }

    public get isBest(): boolean {
        return this._isBest;
    }

    public get indicators(): string[] {
        return this._indicators;
    }

    public get chars(): ContractCharacter[] {
        return this._chars;
    }

    public getEntity(): ContractRecordEntity {
        return {
            contractId: this.contractId,
            ts: this.ts,
            passTs: this.passTs,
            isPass: this.isPass,
            indicatorCount: this.indicatorCount,
            passWave: this.passWave,
            isBest: this.isBest,
            indicators: this.indicators,
            chars: this.chars.map(char => char.getEntity())
        };
    }
}