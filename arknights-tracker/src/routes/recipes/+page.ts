import type { IItem } from "$lib/classes/gameData/items/IItem";
import { itemStorage } from "$lib/dataStorages/items/itemStorage";
import { redirect } from "@sveltejs/kit";
import type { PageLoad } from "./$types";

export const load: PageLoad = ({ url }) => {
    const itemId: string | null = url.searchParams.get("id") ?? null;

    let item: IItem | null = null;

    if (itemId) {
        item = itemStorage.byGameId.get(itemId) ?? null;

        if (!item) {
            redirect(307, "/recipes");
        }
    }

    return {
        itemId: item?.gameId ?? null
    };
};