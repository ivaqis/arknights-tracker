import { FoodTabType } from "$lib/classes/tabs/food/FoodTabType";
import { foodStorage } from "$lib/dataStorages/items/foodStorage";
import { redirect } from "@sveltejs/kit";
import type { PageLoad } from "./$types";

export const load: PageLoad = ({ url }) => {
    const itemId = url.searchParams.get("itemId");
    const tab = url.searchParams.get("tab");

    if (itemId) {
        const food = foodStorage.byGameId.get(itemId);

        if (!food) {
            redirect(307, "/food");
        }
    }

    if (!tab || !FoodTabType.isFoodTabType(tab)) {
        if (itemId) {
            redirect(307, `/food?tab=${FoodTabType.OVERVIEW}&itemId=${itemId}`);
        }

        redirect(307, `/food?tab=${FoodTabType.OVERVIEW}`);
    }

    return {
        tab: tab as FoodTabType,
        itemId: itemId,
    };
};