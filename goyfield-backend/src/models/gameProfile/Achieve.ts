import { AchieveEntity } from "@models/gameProfile/entities/AchieveEntity.js";
import { IEntityClass } from "@models/IEntityClass.js";
import { AchieveData } from "@services/skportDetailFetcher/contracts/DetailData.js";
import { achievementNameRecords } from "@staticModels/instances.js";

export class Achieve implements IEntityClass<AchieveEntity> {
    private readonly _achieveMedals: AchieveEntity["achieveMedals"];
    private readonly _display?: Record<string, string>;
    private readonly _count?: number;

    private constructor(entity: AchieveEntity) {
        this._achieveMedals = entity.achieveMedals || [];
        this._display = entity.display;
        this._count = entity.count;
    }

    public static getFromData(data?: AchieveData | null): Achieve | null {
        if (!data) return null;
        const medals = (data.achieveMedals || []).map((m: any) => {
            const rawName = m.achievementData?.name || m.name || "";
            let id = achievementNameRecords.getId(rawName);
            if (!id && rawName) {
                const trimmed = rawName.replace(/^["'“”«»`]+|["'“”«»`]+$/g, '').trim();
                id = achievementNameRecords.getId(trimmed) || achievementNameRecords.getId(`"${trimmed}"`);
            }
            let medalId: string = id || m.achievementData?.id || m.id || "";

            return {
                id: medalId,
                name: rawName,
                level: Number(m.level ?? 1),
                isPlated: Boolean(m.isPlated),
                obtainTs: String(m.obtainTs || "")
            };
        });

        return new Achieve({
            achieveMedals: medals,
            display: data.display,
            count: data.count
        });
    }

    public static getFromEntity(entity?: AchieveEntity | null): Achieve | null {
        if (!entity) return null;
        return new Achieve(entity);
    }

    public get achieveMedals() {
        return this._achieveMedals;
    }

    public get display() {
        return this._display;
    }

    public get count() {
        return this._count;
    }

    public getEntity(): AchieveEntity {
        return {
            achieveMedals: this._achieveMedals,
            display: this._display,
            count: this._count
        };
    }
}
