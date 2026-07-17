import { logger } from "@/logger";
import { CharSkill } from "@models/gameProfile/CharSkill";
import { CharacterEntity } from "@models/gameProfile/entities/CharacterEntity";
import { CharSkillEntity } from "@models/gameProfile/entities/CharSkillEntity";
import { Equip } from "@models/gameProfile/Equip";
import { TacticalItem } from "@models/gameProfile/TacticalItem";
import { Talent } from "@models/gameProfile/Talent";
import { Weapon } from "@models/gameProfile/Weapon";
import { IEntityClass } from "@models/IEntityClass";
import { CharData } from "@services/skportDetailFetcher/contracts/CharData";
import { SkillData } from "@services/skportDetailFetcher/contracts/SkillData";
import { UserSkillData } from "@services/skportDetailFetcher/contracts/UserSkillData";
import { charNameRecords } from "@staticModels/instances";

export class Character implements IEntityClass<CharacterEntity> {
    private readonly _id: string;
    private readonly _level: number;
    private readonly _potentialLevel: number;
    private readonly _ownTs: string;
    private readonly _skills: CharSkill[];
    private readonly _bodyEquip: Equip | null;
    private readonly _armEquip: Equip | null;
    private readonly _firstAccessory: Equip | null;
    private readonly _secondAccessory: Equip | null;
    private readonly _tacticalItem: TacticalItem | null;
    private readonly _weapon: Weapon | null;
    private readonly _talent: Talent;
    private readonly _apiId: string;

    private constructor(id: string,
                        level: number,
                        potentialLevel: number,
                        ownTs: string,
                        skills: CharSkill[],
                        bodyEquip: Equip | null,
                        armEquip: Equip | null,
                        firstAccessory: Equip | null,
                        secondAccessory: Equip | null,
                        tacticalItem: TacticalItem | null,
                        weapon: Weapon | null,
                        talent: Talent,
                        apiId: string
    ) {
        this._id = id;
        this._level = level;
        this._potentialLevel = potentialLevel;
        this._ownTs = ownTs;
        this._skills = skills;
        this._bodyEquip = bodyEquip;
        this._armEquip = armEquip;
        this._firstAccessory = firstAccessory;
        this._secondAccessory = secondAccessory;
        this._tacticalItem = tacticalItem;
        this._weapon = weapon;
        this._talent = talent;
        this._apiId = apiId;
    }

    public static getFromData(data: CharData): Character {
        let id = charNameRecords.getId(data.charData.name);

        if (!id) {
            throw new Error(`charId not found:\n${JSON.stringify(data, undefined, 2)}`);
        }

        return new Character(
            id,
            data.level,
            data.potentialLevel,
            data.ownTs,
            this.getSkills(data.userSkills, data.charData.skills),
            Equip.getFromData(data.bodyEquip),
            Equip.getFromData(data.armEquip),
            Equip.getFromData(data.firstAccessory),
            Equip.getFromData(data.secondAccessory),
            TacticalItem.getFromData(data.tacticalItem),
            Weapon.getFromData(data.weapon),
            Talent.getFromData(data.talent),
            data.id
        );
    }

    public static getFromEntity(entity: CharacterEntity): Character {
        return new Character(
            entity.id,
            entity.level,
            entity.potentialLevel,
            entity.ownTs,
            this.getSkillsFromEntity(entity.skills),
            Equip.getFromEntity(entity.bodyEquip),
            Equip.getFromEntity(entity.armEquip),
            Equip.getFromEntity(entity.firstAccessory),
            Equip.getFromEntity(entity.secondAccessory),
            TacticalItem.getFromEntity(entity.tacticalItem),
            Weapon.getFromEntity(entity.weapon),
            Talent.getFromEntity(entity.talent),
            entity.apiId
        );
    }

    private static getSkillsFromEntity(skills: CharSkillEntity[]): CharSkill[] {
        return skills.map(skill => CharSkill.getFromEntity(skill));
    }

    private static getSkills(userSkills: Record<string, UserSkillData>, skills: SkillData[]): CharSkill[] {
        const result: CharSkill[] = [];

        for (const skillData of skills) {
            let userSkill = userSkills[skillData.id];

            if (!userSkill) {
                logger.warn(`no userSkill found for ${JSON.stringify(skillData, undefined, 2)}`);
                continue;
            }

            let skill = CharSkill.getFromData(userSkill, skillData);

            result.push(skill);
        }

        return result;
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

    public get ownTs(): string {
        return this._ownTs;
    }

    public get skills(): CharSkill[] {
        return this._skills;
    }

    public get bodyEquip(): Equip | null {
        return this._bodyEquip;
    }

    public get armEquip(): Equip | null {
        return this._armEquip;
    }

    public get firstAccessory(): Equip | null {
        return this._firstAccessory;
    }

    public get secondAccessory(): Equip | null {
        return this._secondAccessory;
    }

    public get tacticalItem(): TacticalItem | null {
        return this._tacticalItem;
    }

    public get weapon(): Weapon | null {
        return this._weapon;
    }

    public get talent(): Talent {
        return this._talent;
    }

    public get apiId(): string {
        return this._apiId;
    }

    public getEntity(): CharacterEntity {
        return {
            apiId: this.apiId,
            id: this.id,
            level: this.level,
            potentialLevel: this.potentialLevel,
            ownTs: this.ownTs,
            weapon: this.weapon?.getEntity() ?? null,
            armEquip: this.armEquip?.getEntity() ?? null,
            bodyEquip: this.bodyEquip?.getEntity() ?? null,
            firstAccessory: this.firstAccessory?.getEntity() ?? null,
            secondAccessory: this.secondAccessory?.getEntity() ?? null,
            tacticalItem: this.tacticalItem?.getEntity() ?? null,
            skills: this.skills.map(skill => skill.getEntity()),
            talent: this.talent.getEntity(),
        };
    }
}