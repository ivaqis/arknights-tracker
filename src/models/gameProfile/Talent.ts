import { TalentEntity } from "@models/gameProfile/entities/TalentEntity";
import { IEntityClass } from "@models/IEntityClass";

export class Talent implements IEntityClass<TalentEntity> {
    private readonly _attrNodes: string[];
    private readonly _latestPassiveSkillNodes: string[];
    private readonly _latestFactorySkillNodes: string[];
    private readonly _latestSpaceshipSkillNodes: string[];

    public constructor(entity: TalentEntity) {
        this._attrNodes = entity.attrNodes;
        this._latestPassiveSkillNodes = entity.latestPassiveSkillNodes;
        this._latestFactorySkillNodes = entity.latestFactorySkillNodes;
        this._latestSpaceshipSkillNodes = entity.latestSpaceshipSkillNodes;
    }

    public get attrNodes(): string[] {
        return this._attrNodes;
    }

    public get latestPassiveSkillNodes(): string[] {
        return this._latestPassiveSkillNodes;
    }

    public get latestFactorySkillNodes(): string[] {
        return this._latestFactorySkillNodes;
    }

    public get latestSpaceshipSkillNodes(): string[] {
        return this._latestSpaceshipSkillNodes;
    }

    public getEntity(): TalentEntity {
        return {
            attrNodes: this._attrNodes,
            latestFactorySkillNodes: this._latestFactorySkillNodes,
            latestPassiveSkillNodes: this._latestPassiveSkillNodes,
            latestSpaceshipSkillNodes: this._latestSpaceshipSkillNodes,
        };
    }
}