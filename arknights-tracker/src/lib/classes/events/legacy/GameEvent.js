import {eventId2EventObj} from "$lib/data/events/eventMaps.js";

export class GameEvent {
    _eventObj;

    constructor(eventObj) {
        this._eventObj = eventObj;
    }

    get id() {
        return this._eventObj.id;
    }

    get title() {
        return this._eventObj.title;
    }

    get startTime() {
        return this._eventObj.startTime;
    }

    get endTime() {
        return this._eventObj.endTime;
    }

    get startTimeAsia() {
        return this._eventObj.startTimeAsia;
    }

    get endTimeAsia() {
        return this._eventObj.endTimeAsia;
    }

    get icon() {
        return this._eventObj.icon;
    }

    get url() {
        return this._eventObj.url;
    }

    get color() {
        return this._eventObj.color;
    }

    get layer() {
        return this._eventObj.layer;
    }

    get type() {
        return this._eventObj.type;
    }

    get iconPosition() {
        return this._eventObj.iconPosition;
    }

    get version() {
        return this._eventObj.version;
    }

    get isPermanent() {
        return this._eventObj.isPermanent ?? false;
    }

    static getEvent(eventId) {
        let eventObj = eventId2EventObj[eventId];

        if (!eventObj) return null;

        return new GameEvent(eventObj);
    }

    static isEvent(eventId) {
        return eventId2EventObj.hasOwnProperty(eventId);
    }
}