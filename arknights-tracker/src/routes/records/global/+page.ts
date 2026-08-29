import { Banner } from "$lib/classes/banners/Banner";
import { GameBannerType } from "$lib/classes/banners/GameBannerType";
import { redirect } from "@sveltejs/kit";
import type { PageLoad } from "./$types";

export const load: PageLoad = ({ url }) => {
    const bannerId = url.searchParams.get("id");
    const banner = bannerId === null ? null : Banner.getByGameId(bannerId);

    if (!banner) {
        const defaultBanner = getDefaultBanner();

        redirect(307, `/records/global?id=${defaultBanner.gameId}`);
    }

    return {
        banner: banner
    };
};

function getDefaultBanner(): Banner {
    const banners = Banner.getListByGameType(GameBannerType.CHAR_SPECIAL);

    return banners.at(-1) ?? Banner.STANDARD;
}