import {resourcePoints} from "$lib/data/items/resourcePoints.js";

export const itemId2ResourcePointId = getItemId2ResourcePointId(resourcePoints);

function getItemId2ResourcePointId(table) {
    let map = {};

    for (const resourcePoint of Object.values(table)) {
        let id = resourcePoint.id;
        let itemId = resourcePoint.itemId;

        map[itemId] = id;
    }

    return map;
}