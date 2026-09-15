import { GameEventType } from "$lib/classes/events/GameEventType";
import type { IGameEvent } from "$lib/classes/events/IGameEvent";
import type { IImageIcon } from "$lib/classes/icons/IImageIcon";
import { ImageVariant } from "$lib/classes/icons/ImageVariant";
import type { EventData } from "$lib/data/types/events/EventData";
import { getDateTime } from "$lib/utils/textUtils";

export class GameEvent<T extends GameEventType> implements IGameEvent<T> {
    private readonly _eventData: EventData<T>;

    private readonly _startTime: Date;
    private readonly _endTime: Date;
    private readonly _startTimeAsia: Date | null;
    private readonly _endTimeAsia: Date | null;
    private readonly _icon: IImageIcon;

    public constructor(eventData: EventData<T>) {
        this._eventData = eventData;

        this._startTime = getDateTime(eventData.startTime);
        this._endTime = getDateTime(eventData.endTime);
        this._startTimeAsia = eventData.startTimeAsia ? getDateTime(eventData.startTimeAsia) : null;
        this._endTimeAsia = eventData.endTimeAsia ? getDateTime(eventData.endTimeAsia) : null;
        this._icon = {
            iconId: eventData.icon,
            imageVariant: ImageVariant.EVENT_ICON
        };
    }

    public get color(): string {
        return this._eventData.color;
    }

    public get endTime(): Date {
        return this._endTime;
    }

    public get endTimeAsia(): Date | null {
        return this._endTimeAsia;
    }

    public get i18nKey(): string {
        return this._eventData.title;
    }

    public get icon(): IImageIcon {
        return this._icon;
    }

    public get iconPosition(): number {
        return this._eventData.iconPosition;
    }

    public get id(): string {
        return this._eventData.id;
    }

    public get layer(): number {
        return this._eventData.layer;
    }

    public get name(): string | null {
        return this._eventData.name || null;
    }

    public get officialUrl(): string | null {
        return this._eventData.officialUrl || null;
    }

    public get startTime(): Date {
        return this._startTime;
    }

    public get startTimeAsia(): Date | null {
        return this._startTimeAsia;
    }

    public get title(): string {
        return this.i18nKey;
    }

    public get type(): T {
        return this._eventData.type as T;
    }

    public get url(): string | null {
        return this._eventData.url || null;
    }

    public get version(): string {
        return this._eventData.version;
    }

    public get isPermanent(): boolean {
        return this.type === GameEventType.IN_GAME_PERMANENT
            || !!this._eventData.isPermanent;
    }
}