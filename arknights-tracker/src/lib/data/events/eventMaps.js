import { rawEvents } from "$lib/data/timeline";

export const eventId2EventObj = getEventId2EventObj(rawEvents);

function getEventId2EventObj(list) {
    let map = {};

    for (let eventObj of list) {
        let eventId = eventObj.id;

        map[eventId] = eventObj;
    }

    return map;
}