import { logger } from "@/logger";
import { CharSkill } from "@models/gameProfile/CharSkill";
import { CharacterEntity } from "@models/gameProfile/entities/CharacterEntity";
import { Weapon } from "@models/gameProfile/entities/Weapon";
import { Equip } from "@models/gameProfile/Equip";
import { TacticalItem } from "@models/gameProfile/TacticalItem";
import { Talent } from "@models/gameProfile/Talent";
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

    public constructor(entity: CharData) {
        let id = charNameRecords.getId(entity.charData.name);

        if (!id) {
            throw new Error(`charId not found:\n${entity}`);
        }

        this._id = id;
        this._level = entity.level;
        this._potentialLevel = entity.potentialLevel;
        this._ownTs = entity.ownTs;
        this._skills = Character.getSkills(entity.userSkills, entity.charData.skills);
        this._bodyEquip = Equip.get(entity.bodyEquip);
        this._armEquip = Equip.get(entity.armEquip);
        this._firstAccessory = Equip.get(entity.firstAccessory);
        this._secondAccessory = Equip.get(entity.secondAccessory);
        this._tacticalItem = TacticalItem.get(entity.tacticalItem);
        this._weapon = Weapon.get(entity.weapon);
        this._talent = new Talent(entity.talent);
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

    private static getSkills(userSkills: Record<string, UserSkillData>, skills: SkillData[]): CharSkill[] {
        const result: CharSkill[] = [];

        for (const skillData of skills) {
            let userSkill = userSkills[skillData.id];

            if (!userSkill) {
                logger.warn(`no userSkill found for ${skillData}`);
            }

            let skill = new CharSkill(userSkill, skillData);

            result.push(skill);
        }

        return result;
    }

    public getEntity(): CharacterEntity {
        return {
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