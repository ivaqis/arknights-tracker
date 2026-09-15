import type { GameEventType } from "$lib/classes/events/GameEventType";
import type { IImageIcon } from "$lib/classes/icons/IImageIcon";
import type { IData } from "$lib/classes/IData";
import type { ITextable } from "$lib/classes/ITextable";

export interface IGameEvent<T extends GameEventType = GameEventType> extends IData, ITextable {
    get type(): T;
    get title(): string;
    get name(): string | null;
    get startTime(): Date;
    get endTime(): Date;
    get startTimeAsia(): Date | null;
    get endTimeAsia(): Date | null;
    get icon(): IImageIcon;
    get iconPosition(): number;
    get url(): string | null;
    get officialUrl(): string | null;
    get color(): string;
    get layer(): number;
    get version(): string;
    get isPermanent(): boolean;
}