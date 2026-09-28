import type { PageLoad } from "./$types";

export const load: PageLoad = ({ url, params }) => {
    const itemId = params.id;

    return {
        itemId: itemId,
    };
};