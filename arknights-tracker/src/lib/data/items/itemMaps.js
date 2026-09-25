import { factoryEvents } from "$lib/data/events/factoryEvents";
import { resourcePoints } from "$lib/data/items/resourcePoints";

export const itemId2ResourcePointId = getItemId2ResourcePointId(resourcePoints);

export const itemId2EventId = getItemId2EventId(factoryEvents);

function getItemId2ResourcePointId(table) {
    let map = {};

    for (const resourcePoint of Object.values(table)) {
        let id = resourcePoint.id;
        let itemId = resourcePoint.itemId;

        map[itemId] = id;
    }

    return map;
}

function getItemId2EventId(table) {
    let map = {};

    for (let factoryEventObj of Object.values(table)) {
        let eventId = factoryEventObj.id;

        for (let itemId of factoryEventObj.eventItemIds) {
            if (!map.hasOwnProperty(itemId)) map[itemId] = [];

            map[itemId].push(eventId);
        }
    }

    return map;
}