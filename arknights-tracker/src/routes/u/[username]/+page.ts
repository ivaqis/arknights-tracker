import type { PageLoad } from "./$types";
import { getUserProfileByName } from "$lib/api.js";

export const load: PageLoad = async ({ params, fetch }) => {
    const username = params.username;
    try {
        const profile = await getUserProfileByName(username, null, fetch);
        return {
            profile,
            username
        };
    } catch {
        return {
            profile: null,
            username
        };
    }
};
