import { CharSkillEntity } from "@models/gameProfile/entities/CharSkillEntity";
import { IEntityClass } from "@models/IEntityClass";
import { SkillData } from "@services/skportDetailFetcher/contracts/SkillData";
import { UserSkillData } from "@services/skportDetailFetcher/contracts/UserSkillData";

export class CharSkill implements IEntityClass<CharSkillEntity> {
    private readonly _type: string;
    private readonly _level: number;
    private readonly _maxLevel: number;

    private constructor(entity: CharSkillEntity) {
        this._type = entity.type;
        this._level = entity.level;
        this._maxLevel = entity.maxLevel;
    }

    public static getFromData(userSkillData: UserSkillData, skillData: SkillData): CharSkill {
        if (userSkillData.skillId !== skillData.id) {
            throw new Error(`SkillId must be equal: ${skillData.id} / ${skillData.id}`);
        }

        return this.getFromEntity({
            type: this.getType(skillData),
            level: userSkillData.level,
            maxLevel: userSkillData.maxLevel
        });
    }

    public static getFromEntity(entity: CharSkillEntity): CharSkill {
        return new CharSkill(entity);
    }

    private static getType(skillData: SkillData) {
        return skillData.type.key;
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
}