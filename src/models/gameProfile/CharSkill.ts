import { CharSkillEntity } from "@models/gameProfile/entities/CharSkillEntity";
import { IEntityClass } from "@models/IEntityClass";
import { SkillData } from "@services/skportDetailFetcher/contracts/SkillData";
import { UserSkillData } from "@services/skportDetailFetcher/contracts/UserSkillData";

export class CharSkill implements IEntityClass<CharSkillEntity> {
    private readonly _type: string;
    private readonly _level: number;
    private readonly _maxLevel: number;

    public constructor(userSkillData: UserSkillData, skillData: SkillData) {
        if (userSkillData.skillId !== skillData.id) {
            throw new Error(`SkillIds must be equal: ${userSkillData.skillId} / ${skillData.id}`);
        }

        this._type = CharSkill.getType(skillData);
        this._level = userSkillData.level;
        this._maxLevel = userSkillData.maxLevel;
    }

    public get type(): string {
        return this._type;
    }

    public get level(): number {
        return this._level;
    }

    public get maxLevel(): number {
        return this._maxLevel;
    }

    public getEntity(): CharSkillEntity {
        return {
            type: this.type,
            level: this.level,
            maxLevel: this.maxLevel,
        };
    }

    private static getType(skillData: SkillData) {
        return skillData.type.key;
    }
}