import { ContractEquip } from "@models/contingencyContract/ContractEquip";
import { ContractWeapon } from "@models/contingencyContract/ContractWeapon";
import { ContractCharEntity } from "@models/contingencyContract/entities/ContractCharEntity";
import { Character } from "@models/gameProfile/Character";
import { IEntityClass } from "@models/IEntityClass";
import { CharData } from "@services/contractRecordFetcher/contracts/CharData";


export class ContractCharacter implements IEntityClass<ContractCharEntity> {
    private readonly _id: string;
    private readonly _level: number;
    private readonly _potentialLevel: number;
    private readonly _weapon: ContractWeapon | null;
    private readonly _bodyEquip: ContractEquip | null;
    private readonly _armEquip: ContractEquip | null;
    private readonly _firstAccessory: ContractEquip | null;
    private readonly _secondAccessory: ContractEquip | null;

    private constructor(id: string,
                        level: number,
                        potentialLevel: number,
                        weapon: ContractWeapon | null,
                        bodyEquip: ContractEquip | null,
                        armEquip: ContractEquip | null,
                        firstAccessory: ContractEquip | null,
                        secondAccessory: ContractEquip | null
    ) {
        this._id = id;
        this._level = level;
        this._potentialLevel = potentialLevel;
        this._weapon = weapon;
        this._bodyEquip = bodyEquip;
        this._armEquip = armEquip;
        this._firstAccessory = firstAccessory;
        this._secondAccessory = secondAccessory;
    }

    public static getFromData(data: CharData, profileChar: Character): ContractCharacter {
        if (data.charId !== profileChar.apiId) {
            throw new Error(`CharId & ApiCharId must be equal:\n${data.charId}\n${profileChar.apiId}`);
        }

        const id = profileChar.id;

        return new ContractCharacter(
            id,
            data.level,
            data.potentialLevel,
            ContractWeapon.getFromData(data.weapon),
            ContractEquip.getFromData(data.equips?.bodyEquip),
            ContractEquip.getFromData(data.equips?.armEquip),
            ContractEquip.getFromData(data.equips?.firstAccessory),
            ContractEquip.getFromData(data.equips?.secondAccessory)
        );
    }

    public static getFromEntity(entity: ContractCharEntity): ContractCharacter {
        return new ContractCharacter(
            entity.id,
            entity.level,
            entity.potentialLevel,
            ContractWeapon.getFromEntity(entity.weapon),
            ContractEquip.getFromEntity(entity.equips.bodyEquip),
            ContractEquip.getFromEntity(entity.equips.armEquip),
            ContractEquip.getFromEntity(entity.equips.firstAccessory),
            ContractEquip.getFromEntity(entity.equips.secondAccessory)
        );
    }

    public get id(): string {
        return this._id;
    }

    public get level(): number {
        return this._level;
    }

    public get potentialLevel(): number {
        return this._potentialLevel;
    }

    public get weapon(): ContractWeapon | null {
        return this._weapon;
    }

    public get bodyEquip(): ContractEquip | null {
        return this._bodyEquip;
    }

    public get armEquip(): ContractEquip | null {
        return this._armEquip;
    }

    public get firstAccessory(): ContractEquip | null {
        return this._firstAccessory;
    }

    public get secondAccessory(): ContractEquip | null {
        return this._secondAccessory;
    }

    public getEntity(): ContractCharEntity {
        return {
            id: this.id,
            level: this.level,
            potentialLevel: this.potentialLevel,
            weapon: this.weapon?.getEntity() ?? null,
            equips: {
                bodyEquip: this.bodyEquip?.getEntity() ?? null,
                armEquip: this.armEquip?.getEntity() ?? null,
                firstAccessory: this.firstAccessory?.getEntity() ?? null,
                secondAccessory: this.secondAccessory?.getEntity() ?? null
            }
        };
    }
}